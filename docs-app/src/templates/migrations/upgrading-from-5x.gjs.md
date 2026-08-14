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

This block is named after what you are rendering — a "section" of the nav — while the type names the data itself, a `PageTree`. They differ on purpose: a section is usually a folder of markdown files, but a group that [collects](/development/configuring-docs.md) other groups contributes one section per group it collects, and those are not folders anywhere on disk. In the example above, `x.section` is a `PageTree` either way.

To assist in this migration, `<PageNav />` will `assert` in development when it is still given a `:collection` block to remind you to migrate to `:section`. The assertion is stripped from production builds.

`getIndexPage` keeps its name (it takes a `PageTree` now), and `Node` is `Page | PageTree`. The `Runtime/utilities/collection-utils` page is now `page-tree-utils`, with a redirect from the old URL.

## `kolay/compiled-docs:virtual` exports the navigation

Alongside `base`, `redirects`, and `groups`, the metamanifest now exports `nav` — a node per top-level group, with the groups it collects beneath it (see [`collection`](/development/configuring-docs.md)). `loadCompiledDocs` puts it on `Manifest.nav`, so `setupKolay()` needs nothing from you.

If you build a manifest by hand (a fixture, a bespoke loader), add it: an empty `nav` means the navigation has no entries.

```diff
  const manifest = {
    base: "/",
    redirects: [],
    groups: [guides, demos],
+   nav: [
+     { name: "guides", group: "guides", children: [] },
+     { name: "demos", group: "demos", children: [] },
+   ],
  };
```

## `docs.tree` is the tree to render, not always the current group's

`docs.tree` is unchanged for a site where no group collects another — it is still the current group's page hierarchy. When a group collects others, a page of a collected group renders the _collecting_ group's tree, so a page list built on `docs.tree` picks that up with no changes. `docs.currentGroup.tree` is always the current group's own.

Two new members go with it, for a nav that has to know which entries exist: `docs.navEntries` (one entry per group nothing collects) and `docs.activeNavEntry` (the entry the current page belongs to). A top-level nav built on `docs.availableGroups` keeps working and keeps listing every group — switching that loop to `navEntries` is what makes a collection visible.

## A group's page tree is named after the group

The root of `Manifest.groups[].tree` (so `docs.tree` and `docs.currentGroup.tree`) was named `'root'` — a placeholder from parsing. It is now the group's name, with a matching `path` and `cleanedName`, like every other folder in the tree. That is what lets a group's tree be rendered as a labeled section of another group's page list, when it is [collected](/development/configuring-docs.md) by one.

Only matters if you read or matched on the root's own name:

```diff
- if (tree.name === 'root') { /* the top of the tree */ }
+ if (tree.name === docs.selectedGroup) { /* the top of the tree */ }
```

## `<PageNav />`'s default `aria-label` is "Pages"

It was "Selected Group", which stops being true once a group collects others: that one `<nav>` then lists the pages of several groups, and a group with no `src` of its own is not a group with pages at all. "Pages" is true either way, and pairs with `<GroupNav />`'s "Groups".

Only matters if you selected on it — in a test, or in CSS:

```diff
- nav[aria-label="Selected Group"]
+ nav[aria-label="Pages"]
```

Both components spread `...attributes` after their own `aria-label`, so passing your own still wins.

## `<GroupNav />`'s link for the co-located pages

The entry for the co-located pages (`app/templates` / `src/templates`) linked at `/Home`, where no page is served — those pages live in the root URL space. It now links at the app's root, and `@homeName` applies to it (it was read only inside the branch that never fired). Nothing to change unless you worked around it — by hiding that entry, or hard-coding a link to `/`, or relying on `/Home` redirecting through `handlePotentialIndexVisit`.

## Removed types

`Options`, `MarkdownPagesOptions`, and `APIDocsOptions` (from `kolay/build` / `kolay/types`) described the old options shapes and are gone. `kolay/build` exports `DocsOptions` instead.
