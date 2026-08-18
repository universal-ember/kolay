# Upgrading from 5.x

The plugin API changed, so that the plugins compose better ([#323](https://github.com/universal-ember/kolay/issues/323)). This page lists every breaking change.

## `kolay()` is split into `docs()` + `apiDocs()`

The combined plugin is removed. You now configure the markdown docs and the api docs separately:

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

`typedoc()` was a temporary name for `apiDocs()`. If your version is 5.5 or later and it has `typedoc()`, this is the same rename.

`kolay/webpack` is also removed. The plugins work only with Vite.

## `docs()` takes `(groupName, options)` — one usage per group

The `groups: []` array is removed. Call `docs()` one time for each group:

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

If the first argument is a path or a URL, its last segment becomes the group name. The argument is also the `src`:

```js
docs(import.meta.resolve("./guides")); // group: "guides"
```

With no arguments, `docs()` serves only the co-located pages, in `app/templates` and `src/templates`. The markdown options of a usage (`remarkPlugins`, `rehypePlugins`, `scope`) apply only to the `.gjs.md` files of that group.

## `apiDocs()` takes an array of strings

There is no options object, and the `dest` option is removed. The JSON is always under `docs/`:

```diff
- typedoc({ packages: ["my-library"], dest: "api" }),
+ apiDocs(["my-library", "./packages/my-other-library"]),
```

Kolay validates the entries when the config loads. A package name must be installed, and a relative path must exist. A path _inside_ a package is not permitted, because the entry points come from `package.json#exports`.

## Routing: per-group virtual modules

Mount the routes of a group with its virtual module:

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

The top-level `addRoutes(this)` is now optional. It serves the co-located pages, and any group that the URL names, from the root URL space. Keep it if you have pages in `app/templates`, or if you want the URLs of 5.x. An app can also mount only the routes of its groups, and keep the root for itself. One mount for each group gives you one route template for each group, and with it a [design for each group](/development/configuring-docs.md).

## `kolay/compiled-docs:virtual` is now the metamanifest

If you import it directly, and not through `setupKolay()`, its shape is different. It now lists the groups, and how to load the module of each group. It no longer holds one combined manifest:

```diff
- const { manifest, pages } = await import("kolay/compiled-docs:virtual");
+ import { loadCompiledDocs } from "kolay";
+
+ const meta = await import("kolay/compiled-docs:virtual");
+ const { manifest, pages } = await loadCompiledDocs(meta);
```

`setupKolay()`, and `setupKolay` from `kolay/test-support`, do this for you. They load every group in parallel.

## `Collection` is now `PageTree`/`section`

A node in a page tree is the object that kolay builds from a directory of markdown files. Its earlier name was `Collection`. Its name is now **`PageTree`**. This frees the word "collection" for the navigation, where one group can "collect" other groups.

For the type and type guard, this is a direct rename:

```diff
- import { isCollection } from 'kolay';
- import type { Collection } from 'kolay';
+ import { isPageTree } from 'kolay';
+ import type { PageTree } from 'kolay';

- if (isCollection(node)) { … }
+ if (isPageTree(node)) { … }
```

The `<:collection>` named block of `<PageNav />` is now `<:section>`:

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

The name of the block comes from what you render, a "section" of the nav. The name of the type comes from the data, a `PageTree`. The two names are different for a reason. A section is usually a folder of markdown files. But after we merge the feature that lets a group "collect" other groups, a section can also be that collection. In the example above, `x.section` is a `PageTree` in both cases.

To help with this migration, `<PageNav />` calls `assert` in development when it still receives a `:collection` block. The message reminds you to change to `:section`. A production build removes the assertion.

`getIndexPage` keeps its name, and it now takes a `PageTree`. `Node` is `Page | PageTree`. The page `Runtime/utilities/collection-utils` is now `page-tree-utils`, with a redirect from the old URL.

## Removed types

`Options`, `MarkdownPagesOptions`, and `APIDocsOptions`, from `kolay/build` and `kolay/types`, described the old options shapes. They are removed. `kolay/build` exports `DocsOptions`.
