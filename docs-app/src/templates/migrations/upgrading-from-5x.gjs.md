# Upgrading from 5.x

The plugin API was reworked for composability ([#323](https://github.com/universal-ember/kolay/issues/323)). This page covers every breaking change.

## `kolay()` is split into `docs()` + `apiDocs()`

The combined plugin is gone. Markdown docs and api docs are configured separately:

```diff
- import { kolay } from "kolay/vite";
+ import { docs, apiDocs } from "kolay/vite";

  export default defineConfig({
    plugins: [
-     kolay({
-       groups: [{ name: "Docs", src: import.meta.resolve("./docs") }],
-       packages: ["my-library"],
-       scope: `...`,
-     }),
+     docs("Docs", {
+       src: import.meta.resolve("./docs"),
+       scope: `...`,
+     }),
+     apiDocs(["my-library"]),
    ],
  });
```

(`typedoc()` was a brief intermediate name for `apiDocs()` — if you're on a 5.5+ version that had it, it's the same rename.)

`kolay/webpack` is gone with it — the plugins are Vite-only.

## `docs()` takes `(groupName, options)` — one usage per group

The `groups: []` array is gone. Call `docs()` once per group:

```diff
- docs({
-   groups: [
-     { name: "guides", src: import.meta.resolve("./guides") },
-     { name: "api", src: import.meta.resolve("./api-docs") },
-   ],
- }),
+ docs("guides", { src: import.meta.resolve("./guides") }),
+ docs("api", { src: import.meta.resolve("./api-docs") }),
```

When the first argument is a path or URL, its last segment becomes the group name (and it serves as the `src`):

```js
docs(import.meta.resolve("./guides")); // group: "guides"
```

With no arguments, only the co-located pages (`app/templates`, `src/templates`) are served. Each usage's markdown options (`remarkPlugins`, `rehypePlugins`, `scope`) apply to that group's `.gjs.md` files only.

## `apiDocs()` takes an array of strings

No options object, and the `dest` option is gone (JSON always lives under `docs/`):

```diff
- typedoc({ packages: ["my-library"], dest: "api" }),
+ apiDocs(["my-library", "./packages/my-other-library"]),
```

Entries are validated when the config loads: package names must be installed, relative paths must exist, and paths _within_ packages are rejected (entry points come from `package.json#exports`).

## Routing: per-group virtual modules

The primary way to mount a group's routes is now its virtual module:

```diff
- import { addRoutes } from "kolay";
+ import { addRoutes as addGuidesRoutes } from "virtual:kolay/docs/guides";

  Router.map(function () {
-   addRoutes(this);
+   this.route("guides", function () {
+     addGuidesRoutes(this);
+   });
  });
```

The top-level `addRoutes(this)` is now optional — it serves the co-located pages (and any group named by the URL) from the root URL space, so keep it if you have `app/templates` pages or want 5.x-style URLs. An app can also mount only its groups' routes and keep the root for itself. Per-group mounts unlock per-group route templates (and with them, [per-group designs](/development/configuring-docs.md)).

## `kolay/compiled-docs:virtual` is now the metamanifest

If you imported it directly (rather than through `setupKolay()`), its shape changed — it lists the groups and how to load each group's module, instead of carrying one combined manifest:

```diff
- const { manifest, pages } = await import("kolay/compiled-docs:virtual");
+ import { loadCompiledDocs } from "kolay";
+
+ const meta = await import("kolay/compiled-docs:virtual");
+ const { manifest, pages } = await loadCompiledDocs(meta);
```

`setupKolay()` and `setupKolay` from `kolay/test-support` do this for you (loading every group in parallel).

## `Collection` is now `PageTree`/`section`

A node in a page tree (the object built from a directory of markdown files) was previously called a `Collection`. It is now called a **`PageTree`** in order to free up the word "collection" for the navigation-level concept of one group "collecting" others.

For the type and type guard, this is a direct rename:

```diff
- import { isCollection } from 'kolay';
- import type { Collection } from 'kolay';
+ import { isPageTree } from 'kolay';
+ import type { PageTree } from 'kolay';

- if (isCollection(node)) { … }
+ if (isPageTree(node)) { … }
```

Similarly, `<PageNav />`'s `<:collection>` named block is now called `<:section>`:

```diff
  <PageNav>
    <:page as |x|>
      <x.Link>{{x.page.name}}</x.Link>
    </:page>
-   <:collection as |x|>
+   <:section as |x|>
      {{#if x.index}}
-       <x.index.Link>{{x.collection.name}}</x.index.Link>
+       <x.index.Link>{{x.section.name}}</x.index.Link>
      {{else}}
-       {{x.collection.name}}
+       {{x.section.name}}
      {{/if}}
-   </:collection>
+   </:section>
  </PageNav>
```

This block is named after what you are rendering — a "section" of the nav — while the type names the data itself, a `PageTree`. They differ on purpose: a section is usually a folder of markdown files, but once we merge a feature allowing groups to "collect" other groups, the section will be made up of this collection. In the example above, `x.section` is a `PageTree` either way.

To assist in this migration, `<PageNav />` will `assert` in development when it is still given a `:collection` block to remind you to migrate to `:section`. The assertion is stripped from production builds.

`getIndexPage` keeps its name (it takes a `PageTree` now), and `Node` is `Page | PageTree`. The `Runtime/utilities/collection-utils` page is now `page-tree-utils`, with a redirect from the old URL.

## `isIndex` matches on name, and `x.index` covers every folder

`isIndex` tested the path (`path.replace(/\.md$/, '').endsWith('index')`), so `api-index.md` counted as a folder's index page. It now tests `name === 'index'` through a shared `isIndexName`, which sorting uses too — the two disagreed, and a page could end up neither listed nor linked. For a folder holding such a file: `getIndexPage` no longer returns it, and `<PageNav />` no longer hides it from the page list.

`<PageNav />`'s `:section` block keeps yielding `index`, and it is now present for **every** folder that has pages, not only ones holding an `index` page. It goes wherever the folder's own URL goes: the index page when there is one, the first page otherwise. No consumer change is needed — `{{#if x.index}}` blocks keep working and simply light up for more folders.

An actual index page is still omitted from the `:page` block, since the heading represents it. A first page standing in for one is not: it is a page in its own right and stays in the list.

The default rendering (when you pass no `:section` block) labels the heading with the folder's name rather than the index page's.

## Removed types

`Options`, `MarkdownPagesOptions`, and `APIDocsOptions` (from `kolay/build` / `kolay/types`) described the old options shapes and are gone. `kolay/build` exports `DocsOptions` instead.

## A folder's index page now sorts first regardless of extension

`index.md` has always been hoisted to the top of the folder holding it. `index.gjs.md` and `index.gts.md` were not, even though `betterSort` appeared to test for them: the build strips those extensions off `path` before sorting runs, so the test never matched. They now sort first too.

Two things move on any folder with a `.gjs.md` or `.gts.md` index and no `meta.json` `order`:

- The nav lists the index page first, where it used to appear in alphabetical position.
- `group.list[0]` becomes that index page, and with it the page a group's own URL resolves to.

A folder with a `meta.json` `order` is unaffected, because `applyPredestinedOrder` already hoisted `index` on its own.

To keep the old placement, give that folder a `meta.json` `order`.

The match also moved from the node's path to its name, which changes two more things:

- A **folder** named `index` now sorts first among its siblings. Folders were never matched before, because a folder's path is a bare segment.
- A page whose basename merely _ends_ in `index` no longer hoists. `api-index.md` used to, because `/foo/api-index.md` satisfies `path.endsWith('index.md')`; now only a page actually named `index` is hoisted. Rename it, or give the folder a `meta.json` `order`.

## A page tree's URL resolves to its first page, without wiring

`/Group/sub-folder` used to render the error page. It now redirects to that tree's first page, wired by `setupKolay` to the router rather than by any hook you call.

Two consequences:

- A URL that used to error now navigates. Anything asserting on the error page for a folder URL will need updating.
- A group root resolves this way too, on every mount shape — so `/Group` on a top-level mount and `/guides` on a nested one no longer depend on `handlePotentialIndexVisit`. An app that never called it gets those redirects anyway. This also fixes the case no route hook could serve: arriving at a mount's own URL from a page already inside that mount, which is where the group's own nav link points.

Keep calling `handlePotentialIndexVisit` for the app root (`/`), which names no group for a transition to resolve. Calling it elsewhere is harmless.
