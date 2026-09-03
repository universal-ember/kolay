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

## A folder's index page falls back to its first page

In 5.x a page was only considered a folder's index page if its file was explicitly named `index`. The index page is now the page named `index` _when there is one_, falling back to the folder's first page otherwise.

For example, the `<PageNav>` component's `:section` block still yields `index`, but it is present for every folder now:

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

**Note the change from `x.index.page.title` to `x.section.title`.** Left as `x.index.page.title`, a folder without a page named `index` will show its first page's title where in 5.x it showed the folder's name. The `{{else}}` branch is also unreachable for any folder that has pages.

With no `:section` block of your own, headings render `x.section.title` instead of the index page's `name` — which in 5.x was the literal string `index`.

`getIndexPage(tree)` follows the same change, so it now answers for every folder with pages where it used to answer `undefined`. Two smaller shifts come with it: it can descend into a first child folder, and it matches the page actually named `index` rather than any path ending in `index` — `api-index.md` no longer counts.

`isIndex` is removed. It asked whether a node was named `index`, which on its own does not answer anything a nav needs. If you were using it to decide what a folder's heading links to, that is `getIndexPage(tree)`; to decide whether listing a page repeats its folder's heading, that is `isRedundantWithHeading(folder, page)`.

## Folder and group URLs redirect instead of erroring

`/Group/sub-folder` used to render the error page. It now redirects to that folder's index page, and you call nothing to get it. A group's own URL redirects the same way.

- Anything asserting on the error page for a folder URL needs updating.
- `handlePotentialIndexVisit` is only needed for the app root (`/`) now. Calling it elsewhere is harmless.

## Page titles honor the page's first heading

A page with no declared `title` was titled by its filename. It is now titled by its first heading, falling back to the filename when it has none — so a page at `ember-resources.md` headed `# cell` reads "cell" in the nav, in search results, and in a folder heading that links to it.

5.x resolved headings only for `.gjs.md` and `.gts.md` pages, whose text the build inlines; plain `.md` pages never got past the filename, and the nav and search disagreed about them. The build now reads every markdown page's headings.

Search scores a page's path as well, so a page stays findable by its filename even when its heading says something else.

Declare `title` in a page's sidecar `.json` to keep the old text.

## `<PageNav />` renders page links by title

The default `:page` block rendered `page.name`, the raw filename, while folder headings render a resolved title. Both are titles now. Pass your own `:page` block to render something else:

```hbs
<:page as |x|>
  <x.Link>{{x.page.name}}</x.Link>
</:page>
```

## Removed types

`Options`, `MarkdownPagesOptions`, and `APIDocsOptions` (from `kolay/build` / `kolay/types`) described the old options shapes and are gone. `kolay/build` exports `DocsOptions` instead.
