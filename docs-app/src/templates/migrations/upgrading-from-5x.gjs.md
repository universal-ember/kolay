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

`Node` is `Page | PageTree`. The `Runtime/utilities/collection-utils` page is now `page-tree-utils`, with a redirect from the old URL.

## A folder's index page is now whichever page its URL goes to

In 5.x a folder only had an index page if the author wrote one named `index`. A folder without one had no page to link its heading to, so it rendered as plain text.

A folder's index page is now the page its own URL goes to: the page named `index` when there is one, and the folder's first page otherwise. Every folder with pages has one.

### `:section`'s `index` is present for every folder

```diff
  <:section as |x|>
    {{#if x.index}}
-     <x.index.Link>{{x.index.page.title}}</x.index.Link>
+     <x.index.Link>{{x.section.title}}</x.index.Link>
    {{else}}
      {{x.section.title}}
    {{/if}}
  </:section>
```

**If your heading text comes from the index page, change it to `x.section.title`.** Otherwise a folder without a page named `index` will display its first page's title where 5.x displayed the folder's name. Your `{{else}}` branch is now unreachable for any folder that has pages.

`x.section.title` is new — see below — and is what the folder heading should say.

A page whose `title` equals its folder's is left out of the `:page` block, since the heading already links to it under the same words. That replaces 5.x's rule of always hiding a page named `index`, and you can reproduce it yourself:

```js
const hidden = page.title === folder.title;
```

### `getIndexPage` and `isIndex` are removed

`getIndexPage` returned only an author-written `index` page, but was documented for the heading-link question — "useful for making folder names in navigation link to an index page" — which is why folders without one went unlinked. Use `<PageNav />`'s `index`, or `indexPageFor(tree)` on the docs service.

`isIndex` is removed for the same reason: it answered "is this page named `index`" while reading like the general question. If you need it, the check is `page.name === 'index'`.

### Folder and page titles

`PageTree` carries a `title`, so an app no longer derives section headings itself. Titles resolve the same way for pages and folders, in navigation and in search:

|          | resolves to                                                                           |
| -------- | ------------------------------------------------------------------------------------- |
| a folder | its `meta.json` `title`, then its index page's title, then its cleaned directory name |
| a page   | its json `title`, then its first heading, then its cleaned filename                   |

Cleaned names have digits removed, dashes turned into spaces, and are sentence-cased.

With no `:section` block of your own, the default rendering changes:

| folder                                   | 5.x                                | 6.0          |
| ---------------------------------------- | ---------------------------------- | ------------ |
| `meta.json` sets a `title`               | `index`, or the raw directory name | that title   |
| a page named `index` with a `title`      | `index`                            | that title   |
| a page named `index` with only an `# H1` | `index`                            | that heading |
| no page named `index`                    | `sub-folder`                       | `Sub folder` |

5.x rendered the index page's `name` — the literal string `index`.

## A folder's index page sorts first regardless of extension

`index.md` has always been hoisted to the top of the folder holding it. `index.gjs.md` and `index.gts.md` were not: the build strips those extensions before sorting runs, so the test never matched. They now sort first too.

Two things move on any folder with a `.gjs.md` or `.gts.md` index and no `meta.json` `order`:

- The nav lists the index page first, where it used to appear in alphabetical position.
- `group.list[0]` becomes that index page, and with it the page a group's own URL resolves to.

A folder with a `meta.json` `order` is unaffected — an explicit index is hoisted before the order is applied, so it cannot be placed second.

To keep the old placement, give that folder a `meta.json` `order`. Build-time sorting also matches the node's name rather than its path now, so a **folder** named `index` sorts first among its siblings.

## Removed types

`Options`, `MarkdownPagesOptions`, and `APIDocsOptions` (from `kolay/build` / `kolay/types`) described the old options shapes and are gone. `kolay/build` exports `DocsOptions` instead.

## Folder and group URLs redirect instead of erroring

`/Group/sub-folder` used to render the error page. It now redirects to that folder's index page, and you call nothing to get it. A group's own URL redirects the same way.

- Anything asserting on the error page for a folder URL needs updating.
- `handlePotentialIndexVisit` is only needed for the app root (`/`) now. Calling it elsewhere is harmless.
