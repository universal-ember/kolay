# Link states

A kolay docs site navigates with plain `<a>` elements. [`properLinks`](https://ember-primitives.pages.dev/4-routing/proper-links.md), from ember-primitives, catches a click on an anchor when the router recognizes its `href`. It then makes the click a route transition. A markdown link, an anchor that you write in your site chrome, and an anchor inside a shadow root are all router links.

A plain anchor does not get the state classes of `<LinkTo>`: `active`, `ember-transitioning-in`, and `ember-transitioning-out`. You can still get both states. The _active_ state comes from the router service. The _loading_ state comes from the [`selected`](/Runtime/utilities/selected.md) store of kolay. This page shows the code for both.

## Active links

The nav components of kolay mark the active link for you. `<PageNav>` and `<GroupNav>` accept [`@activeClass`](/Runtime/navigation/page-nav.md). They compare the paths with [`isActive`](/Runtime/navigation/is-active.md), which kolay exports for your own nav from the manifest items.

For an anchor with an `href` that you write yourself, ask one question. Does the anchor point at the page of `router.currentURL`? Two details make the word "page" important:

- A page opens with and without the `.md` extension, so remove the extension before you compare.
- The query params and the hash are not part of the identity of a page, so compare only the `pathname`.

Use `aria-current="page"`, and not a class. It means that this link points at the current page. A screen reader announces it, and your CSS can style it directly.

## The loading phase

The transitioning classes of `<LinkTo>` mark the links while a route transition operates. In a kolay app, the transition takes very little time. The route hooks do not await the content, so a transition settles almost immediately. The wait that a reader sees comes after the transition, while the new document loads and compiles. That state is on the [`selected`](/Runtime/utilities/selected.md) store, as `isPending`.

The two states work well together. `router.currentURL` updates when the transition settles, so the anchor becomes active while the old page is still on screen. Kolay keeps the previous document on screen while the next one compiles, so the navigation does not show an empty page. A style for "active _and_ pending" marks the clicked link as busy, where the reader is looking.

## Demo

The demo below highlights the current page with `aria-current`. Click one of the other links. It highlights immediately, then it pulses until that page compiles.

```gjs live preview
import Component from "@glimmer/component";
import { service } from "@ember/service";
import { Shadowed } from "ember-primitives/components/shadowed";
import { selected } from "kolay";

// app-relative paths, written as if the app were deployed at "/"
const pages = [
  { title: "Rendering pages", path: "/development/rendering-pages.md" },
  { title: "Link states", path: "/development/link-states.md" },
  { title: "Ordering pages", path: "/development/ordering-pages.md" },
];

// page identity: the pathname only (no query params / hash),
// with the optional ".md" stripped
function pagePath(url) {
  const { pathname } = new URL(url, window.location.origin);

  return pathname.endsWith(".md") ? pathname.slice(0, -3) : pathname;
}

export default class MiniNav extends Component {
  @service router;

  // the rootURL exists only at the render edge
  hrefFor = (path) => {
    const root = this.router.rootURL ?? "/";

    return (root.endsWith("/") ? root.slice(0, -1) : root) + path;
  };

  // comparisons happen in app-relative space, where currentURL lives
  isCurrent = (path) => pagePath(this.router.currentURL ?? "/") === pagePath(path);

  get isLoading() {
    return selected(this).isPending;
  }

  <template>
    <Shadowed>
      <nav aria-label="Link states demo" data-loading={{if this.isLoading "true"}}>
        {{#each pages as |page|}}
          <a
            href={{this.hrefFor page.path}}
            aria-current={{if (this.isCurrent page.path) "page"}}
          >{{page.title}}</a>
        {{/each}}
      </nav>

      <style>
        nav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        a {
          padding: 0.25rem 0.75rem;
          border: 1px solid rgb(125 125 125 / 0.5);
          color: inherit;
          text-decoration: none;
        }

        a[aria-current="page"] {
          border-color: currentColor;
          font-weight: bold;
        }

        @keyframes busy {
          50% {
            opacity: 0.35;
          }
        }

        nav[data-loading] a[aria-current="page"] {
          animation: busy 0.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          nav[data-loading] a[aria-current="page"] {
            animation: none;
            opacity: 0.5;
          }
        }
      </style>
    </Shadowed>
  </template>
}
```

Note two things:

- The code applies the `rootURL` only when it renders the `href`. The comparisons are in app-relative space, where `router.currentURL` is. A fixed root-absolute `href` fails under a deploy with a `rootURL`, for example a pull request preview at `/pr-1234/`. A markdown link does not have this problem, because the compiler rebases it for you. Read [Links and images](/authoring/links-and-images.md). The problem occurs only for an `href` that you build in component code.
- The demo is inside `<Shadowed>`, so its styles stay in the demo. `properLinks` also works with an anchor inside a shadow root. It finds the anchor with the `composedPath()` of the event.

## Site-wide state

This is the same idea in reverse. Do not give each link its own state. Set the state one time on a wrapper, then let the CSS style every element that must respond. The problem is not limited to links. A CSS variable works well for this:

```gjs
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";

export default class SiteChrome extends Component {
  @service router;

  @tracked isTransitioning = false;

  constructor(owner, args) {
    super(owner, args);

    this.router.on("routeWillChange", () => (this.isTransitioning = true));
    this.router.on("routeDidChange", () => (this.isTransitioning = false));
  }

  <template>
    <div class="site" data-transitioning={{if this.isTransitioning "true"}}>
      {{yield}}
    </div>
  </template>
}
```

```css
.site {
  --transitioning: 0;
}
.site[data-transitioning] {
  --transitioning: 1;
}

/* dim every link while a transition runs */
.site a {
  opacity: calc(1 - var(--transitioning) * 0.4);
  transition: opacity 150ms;
}
```

If your wrapper can be destroyed, remove the listeners in a destructor. Application chrome exists as long as the app, so there is nothing to remove.

`routeWillChange` and `routeDidChange` cover only the work of the router. They are important when your route hooks do async work. For the load and compile phase, set the same attribute or variable from `selected(this).isPending`, as the demo above does.
