# Link states

Kolay docs sites navigate with plain `<a>` elements: [`properLinks`](https://ember-primitives.pages.dev/4-routing/proper-links.md) (from ember-primitives) intercepts clicks on any anchor whose `href` the router recognizes and turns them into route transitions. Markdown links, hand-written anchors in your site chrome, anchors inside shadow roots — they are all router links already.

What plain anchors don't get is `<LinkTo>`'s state classes (`active`, `ember-transitioning-in`, `ember-transitioning-out`). Both states are still derivable — _active_ from the router service, _loading_ from kolay's [`selected`](/Runtime/utilities/selected.md) store — and this page shows the wiring.

## Active links

Kolay's nav components mark the active link for you: `<PageNav>` and `<GroupNav>` accept [`@activeClass`](/Runtime/navigation/page-nav.md), and the comparison they use is exported as [`isActive`](/Runtime/navigation/is-active.md) for custom navs built from manifest items.

For anchors whose `href` you write yourself, the question is: does the anchor point at `router.currentURL`'s page? Two details make "page" the operative word:

- pages are visitable with and without the `.md` extension, so compare with the extension stripped
- query params and the hash are not part of a page's identity, so compare `pathname`s only

And prefer `aria-current="page"` over a class: it means exactly "this link points at the page we are on", screen readers announce it, and CSS can style it directly.

## The loading phase

`<LinkTo>`'s transitioning classes mark links while a route transition runs. In a kolay app, the transition is not where time is spent — route hooks don't await content, so transitions settle almost immediately. The wait users actually see comes after: the new page's document loading and compiling. That state lives on the [`selected`](/Runtime/utilities/selected.md) store, as `isPending`.

The two states compose well. `router.currentURL` updates as soon as the transition settles, so the clicked anchor becomes active while the old page is still on screen (kolay keeps the previous document rendered while the next one compiles, so navigation doesn't flash an empty page). Styling "active _and_ pending" marks the clicked link as busy — exactly where the user is looking.

## Demo

The current page is highlighted below via `aria-current`. Click a sibling: it highlights immediately, and pulses until that page finishes compiling.

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

Two things worth noticing:

- The `rootURL` is applied only when rendering the `href`; comparisons happen in app-relative space, where `router.currentURL` lives. Hardcoding root-absolute `href`s would break under a deploy with a `rootURL` (a PR preview at `/pr-1234/`, say). Markdown links don't have this concern — the compiler rebases those for you (see [Links and images](/authoring/links-and-images.md)) — it only arises for `href`s built in component code.
- The demo is wrapped in `<Shadowed>` so its styles stay contained. `properLinks` handles anchors inside shadow roots too — it finds the anchor through the event's `composedPath()`.

## Site-wide state

The same idea, inverted: instead of each link deriving its own state, set the state once on a wrapper and let CSS reach whatever should respond — the issue isn't limited to links. A CSS variable works well for this:

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

(For a wrapper that can be torn down, remove the listeners in a destructor. Application-level chrome lives as long as the app, so there's nothing to clean up.)

`routeWillChange` / `routeDidChange` only cover the router's part; they matter when your route hooks do real async work. For the document load + compile phase, drive the same kind of attribute (or variable) from `selected(this).isPending`, like the demo above does.
