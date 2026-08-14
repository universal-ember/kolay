# `docs(...)`

Kolay requires some build-time static analysis to function.

`docs(...)` is the only required plugin. This generates the navigation and information about how Kolay's runtime code will fetch the markdown documents deployed with the app's static assets. To also generate api docs from your libraries' type declarations, add the [`apiDocs(...)`][plugin-typedoc] plugin.

[plugin-docs]: /development/configuring-docs.md
[plugin-typedoc]: /TypeDoc/plugin/api-docs.md
[ui-signature]: /TypeDoc/components/component-signature.md
[ui-apiDocs]: /TypeDoc/components/api-docs.md

Usage with Vite:

```js
// vite.config.js
import { docs } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // one usage per group of docs:
    docs("guides", { src: import.meta.resolve("./guides") }),

    // or pass a path or URL directly — its last segment becomes the
    // group name ("demos" here):
    docs(import.meta.resolve("./demos")),

    // with no arguments, only the co-located pages
    // (app/templates, src/templates) are served
    docs(),
  ],
});
```

The second argument holds the group's markdown options (`src`, `remarkPlugins`, `rehypePlugins`, `scope`).

## `scope`

The `scope` option lets you make components, helpers, or other values available inside `.gjs.md` live codefences _at build time_, without needing to import them in each codefence.

This is a string of import statements that gets prepended to every `.gjs.md` file during compilation. Anything imported via `scope` can be used directly in `hbs` and `gjs` live codefences.

```js
// vite.config.js
import { docs } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    docs("Docs", {
      src: import.meta.resolve("./docs"),
      scope: `
        import { APIDocs, ComponentSignature } from 'kolay';
        import { Shadowed } from 'ember-primitives/components/shadowed';
        import { MyCustomComponent } from 'my-library';
      `,
    }),
  ],
});
```

With this config, any `.gjs.md` file can use `<APIDocs />`, `<Shadowed />`, or `<MyCustomComponent />` in live codefences without an explicit import:

````md
# My Page

```hbs live
<Shadowed>
  <MyCustomComponent @foo="bar" />
</Shadowed>
```
````

> **Note:** `scope` only applies to `.gjs.md` files (build-time compiled). For `.md` files (runtime compiled), use the `topLevelScope` option in `setupKolay()` instead.

## Conventions

There are a few ways you can collect docs:

- co-located pages: anything in `app/templates` / `src/templates` is picked up automatically (no group, served from the root URL space) — even with zero-argument `docs()`.
- a group per `docs()` usage: the `src` can point at a `docs` folder anywhere in (or outside) your project — including another package's `components` folder, picking up all markdown found there. This is useful for co-locating docs with their implementations.

## Using the plugin multiple times

`docs()` is used once per group — so multiple groups means multiple usages, each with its own markdown processing (`remarkPlugins`, `rehypePlugins`, `scope`) if needed:

```js
// vite.config.js
export default defineConfig({
  plugins: [
    docs(import.meta.resolve("./guides")),
    docs("api", {
      src: import.meta.resolve("./api-docs"),
      scope: `import { APIDocs } from 'kolay';`,
    }),
    // ...
  ],
});
```

All usages contribute to _one_ manifest: every group shows up in `docsManager`, `<GroupNav />`, etc, exactly as if they had been passed to a single `docs()` call. Each usage's markdown options apply to the `.gjs.md` files under that usage's `groups` — so the `api` group above gets `<APIDocs />` in scope while `guides` does not.

Group names must be unique across all usages.

Each group is then mounted as its own route — primarily through its virtual module's `addRoutes`, which is pre-scoped to the group and brings all of its docs into the route it was called from, no matter what the route's path is:

```js
// app/router.js
import { addRoutes as addGuidesRoutes } from "virtual:kolay/docs/guides";

Router.map(function () {
  this.route("help", function () {
    addGuidesRoutes(this); // /help/... serves the guides group
  });
});
```

(The equivalent lower-level form is `addRoutes(this, "guides")` from `kolay`; an unscoped `addRoutes(this)` inside a route serves whichever group the URL names, so its path must match the group's name.)

Scoped mounts get mount-space URLs everywhere: `<PageNav />` / `<GroupNav />` links, active states, and index redirects all use the mount's URL rather than `/GroupName`. And since every mount is its own route, every mount can have its own route template — its own layout and design per group (this site's Runtime and TypeDoc sections do exactly that).

## `collection`

As monorepos grow, authors frequently want to "collect" packages together in groups in their docs. For example, take a repo publishing `@my-lib/core`, `@my-lib/plugins`, and `@my-lib/utilities`, each documenting itself in its own folder, plus a `guides` folder at the root. By default, this results in four group entries across the top of the site:

```
Guides   Core   Plugins   Utilities
```

Each package's docs stay next to the code they describe. A collection changes only how they are grouped when rendered: every collected group keeps its own pages, URLs, and routes.

These entries can be optionally grouped into "collected groups" by moving them to their respective `collection` array:

```js
// kolay.config.js
export default defineConfig({
  docs: [
    { name: "guides", src: import.meta.resolve("./guides") },

    // one 'Packages' entry, with a section per package
    {
      name: "Packages",
      collection: [
        { name: "core", src: import.meta.resolve("./packages/core/docs") },
        { name: "plugins", src: import.meta.resolve("./packages/plugins/docs") },
        { name: "utilities", src: import.meta.resolve("./packages/utilities/docs") },
      ],
    },
  ],
});
```

With this configuration, the site now reads:

```
Guides   Packages
         └─ clicking it lands on /core — the first group it collects

         and its page list is those groups, as sections:

           Core
             Installation
             Caching
           Plugins
             Writing one
           Utilities
             Helpers
```

A collected group is a group like any other: the same entry shape, taking an `src` and [markdown options](#scope) of its own. A plain string works too, and its last path segment names the group, exactly as it does for a `docs()` usage. Markdown options set on the collecting group are inherited by the groups inside it, unless one sets its own options. Options never travel between separate `docs()` calls, only down into a `collection`.

`src` is required for a collected group, under the same rule as anywhere else: a group needs one _unless_ it collects other groups.

Collected groups can be nested: a collected group can itself collect groups that have `collection` configs of their own, and so on, as deep as you need.

The [`docs()`](#docs) plugin takes `collection` the same way, for a project configuring plugins directly rather than through [`kolay.config.js`](/development/config-file.md):

```js
// vite.config.js
docs("Packages", {
  collection: ["./packages/core/docs", "./packages/plugins/docs"],
}),
```

The collecting group takes the place of the groups it collects. `Core`, `Plugins`, and `Utilities` no longer appear across the top of the site; `Packages` stands where they were, in its own declared position. The navigation shows its name, formatted however the app already formats group names.

Every page in a collected group shows the collecting group's page list, with a section per collected group in declaration order. A reader on `/plugins/writing-one.md` still sees `Core` / `Plugins` / `Utilities`, with `Packages` highlighted.

`src` is optional for a collecting group, and whether it has one decides where its entry links:

- **A collecting group needs no `src`.** `Packages` above has none, because it contributes no pages of its own. Give it one and its pages come first in the page list, above the sections, and its entry links to its own URL.
- **Otherwise the entry links at the first group with pages**, its own or the first it collects, however deep. Clicking `Packages` lands on the `core` group's landing page, so that group's route needs [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) as usual. Reorder the `collection` to land somewhere else.

The following rules are enforced at buildtime:

- Two navigation entries cannot have the same name. A collecting group's name sits in the top-level navigation next to the groups nothing collects, so it has to be unique among them.
- A group can be collected by only one group. It has one set of pages, and would otherwise appear in two places at once.

### Collections at runtime

`<GroupNav />` and `<PageNav />` need no changes. `<GroupNav />` renders one link per entry, and `<PageNav />` renders the collecting group's page list when the reader is inside one.

A collected group is an ordinary [`PageTree`](/Runtime/utilities/page-tree-utils.md), so it goes through `<PageNav />`'s `<:section>` block. That is the same block a folder of markdown files goes through, which is why the block is named for the nav role rather than the filesystem. A section's label is a link when its group has an `index.md`, and plain text otherwise.

Hand-rolled navigation reads the entries from [`docsManager`](/Runtime/utilities/docs-manager.md):

```js
const docs = docsManager(this);

docs.navEntries; // the top-level navigation: a group, with what it collects
docs.activeNavEntry; // the entry the current page belongs to
docs.collectionOf("plugins"); // 'Packages'
```

`collectionOf` takes a group name and returns the name of the entry presenting it, which is the collecting group's name, or the group's own when nothing collects it.

An entry is `{ name, isCollection, groups, href, tree }`. `href` is where it links. `groups` are the groups whose pages it presents, its own first and then the collected ones, depth first. `tree` is the one page list to render for it, and `isCollection` says whether it collects any. Compare `entry.name` against `activeNavEntry.name` for the active state:

```hbs
{{#each this.docs.navEntries as |entry|}}
  <a
    href={{entry.href}}
    class={{if (eq entry.name this.docs.activeNavEntry.name) "active"}}
  >{{entry.name}}</a>
{{/each}}
```

A sidebar built on `docs.tree` needs no change, because it is already the tree to render, whether that is the current group's or the collecting group's. `currentGroup.tree` is still the group's own.

`availableGroups` and `selectedGroup` are deliberately untouched, because they answer where a page lives rather than how the navigation is arranged. `selectedGroup` is the group the current URL resolves to — always the group itself, never the entry presenting it — where `activeNavEntry` is that entry, which is the collecting group when one is involved. Reading `/plugins/writing-one.md`, `selectedGroup` is `plugins` and `activeNavEntry.name` is `Packages`.

So a top-level nav built on `availableGroups` keeps working, and keeps listing every group individually. Switch that loop to `navEntries` to make a collection visible.

## Each group's virtual module

Every `docs()` usage enables a virtual module for its group — `docs('foo')` enables `virtual:kolay/docs/foo`:

```js
import { addRoutes as addFooRoutes, manifest } from "virtual:kolay/docs/foo";
```

- `addRoutes(context)` — pre-scoped route registration: it brings the group's docs into whatever route it's called from, so the router example above can also be written as:

  ```js
  // app/router.js
  import { addRoutes as addGuidesRoutes } from "virtual:kolay/docs/guides";

  Router.map(function () {
    this.route("help", function () {
      addGuidesRoutes(this);
    });
  });
  ```

- `manifest` — the group's own manifest (`{ name, list, tree }`)
- `pages` — the group's page loaders, like `import.meta.glob`
- `meta` — where the source lives:

  ```js
  import { meta } from "virtual:kolay/docs/foo";

  meta.url; // the repository URL, e.g. 'https://github.com/universal-ember/kolay'
  meta.docsPath; // the repo-relative path to this source's docs, e.g. 'docs'
  ```

  `url` comes from the `repository` field of the package.json at the repository root; `docsPath` is where the `docs()` source sits inside that repository — together they can build "edit this page" links.

  A `meta.jsonc` (or `meta.json`) at the root of the source mixes its content in — put anything you want alongside the derived fields (its keys win over them). This is the same file that can hold the source's top-level [`order`](/development/ordering-pages.md), so that key comes along when present.

The co-located pages have one too: `virtual:kolay/docs/Home` (its source is the templates directory, so that is what `docsPath` and `meta.jsonc` refer to).

Group info across _all_ groups comes from the metamanifest, `kolay/compiled-docs:virtual` — it lists every group and how to load its module. `setupKolay()` loads all of them in parallel behind the scenes (via `loadCompiledDocs` from `kolay`), so by default the whole site's navigation is available up front.

Types for these modules ship in `kolay/virtual` (add it to your tsconfig's `types`).

Pair each mount with [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) in the mount's route (e.g. `routes/help.js`) so that visiting `/help` redirects to the first page in the group.

> **Note:** multiple usages are only supported with Vite (the usages discover each other while vite resolves its config). The same applies to [`apiDocs()`](/TypeDoc/plugin/api-docs.md), whose usages merge their packages.
