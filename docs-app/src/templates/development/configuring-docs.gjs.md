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

A monorepo grows a package at a time, and a docs group with it. Say a repo publishes `@my-lib/core`, `@my-lib/plugins`, and `@my-lib/utilities`, each documenting itself in its own folder, plus a `guides` folder at the root. Four groups, four entries across the top of the site:

```
Guides   Core   Plugins   Utilities
```

A group's `collection` is the groups it presents together with its own pages. Declare them inside it:

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

and the site reads:

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

A collected group is a group like any other: the same entry shape, so it takes an `src`, [markdown options](#scope) of its own, and a `collection` of its own — nesting as deep as the reader needs. Its `src` is optional under exactly the same rule as anywhere else: a group needs one _unless_ it collects other groups. A plain string entry works too: its last path segment names the group. Markdown options set on the collecting group are inherited by the groups inside it, unless one sets its own — being nested inside that group's options is what distinguishes it from a separate `docs()` call, which never inherits.

The [`docs()`](#docs) plugin takes `collection` the same way, for a project configuring plugins directly rather than through [`kolay.config.js`](/development/config-file.md):

```js
// vite.config.js
docs("Packages", {
  collection: ["./packages/core/docs", "./packages/plugins/docs"],
}),
```

Nothing about the docs themselves moves: each package's pages stay in its own folder, and stay at their own URLs — `/plugins/writing-one.md` is still `/plugins/writing-one.md`, still served by that group's own route or [scoped mount](#using-the-plugin-multiple-times). A collection exists only in the navigation.

In detail:

- **The collecting group replaces the collected ones in the top-level navigation.** Above, `Core`, `Plugins`, and `Utilities` are gone from the top of the site; `Packages` stands where they were, in its own declared position.
- **The collecting group's name is what the navigation shows** — `Packages` here. It is a group name like any other, so apps format it the way they already format those (`<GroupNav />` and this site both title-case it).
- **A collecting group needs no `src`.** `Packages` above has none: it contributes no pages of its own, and exists to present the three that do. Given an `src`, its own pages come first in the page list, above the sections — and it keeps its own URL, which is then where its entry links.
- **The entry links at the first group with pages** — its own, or the first it collects, however deep. So clicking `Packages` arrives at the `core` group's landing page: its `index.md`, or its first page if it has none. That is the ordinary rule for a group, so that group's route needs [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) as usual. Reorder the `collection` to land somewhere else.
- **The page list beside any of their pages is the collecting group's**, a section per collected group labeled with its name, in declaration order, nesting for a group that collects others. Reading `/plugins/writing-one.md` shows the same `Core` / `Plugins` / `Utilities` list, with `Plugins` the section you are in.
- **A collected group's page keeps the collecting entry active**, so `Packages` stays highlighted while the reader is anywhere inside `core`, `plugins`, or `utilities`.

The rules the build enforces, because a collecting group's name shares the navigation with the group names around it, and its pages come from the groups it collects:

- Two navigation entries cannot have the same name — a collecting group is named alongside the groups that nothing collects.
- A group can be collected by only one group: it has one set of pages, and would otherwise be presented in two places at once.

### Collections at runtime

`<GroupNav />` and `<PageNav />` need no changes: `<GroupNav />` renders one link per entry, and `<PageNav />` renders the collecting group's page list when the reader is inside one. A collected group arrives as an ordinary `PageTree`, so it goes through `<PageNav />`'s `<:section>` block — the same block a folder of markdown files goes through, and the reason that block is named for the nav role rather than for the filesystem. A section's label is a link when its group has an `index.md`, and plain text otherwise.

Hand-rolled navigation reads the navigation from [`docsManager`](/Runtime/utilities/docs-manager.md):

```js
const docs = docsManager(this);

docs.navEntries; // the top-level navigation: a group, with what it collects
docs.activeNavEntry; // the entry the current page belongs to
docs.collectionOf("plugins"); // 'Packages'
```

An entry is `{ name, isCollection, groups, href, tree }`: `href` is where it links, `groups` are the groups whose pages it presents (its own first, then the collected ones, depth first), `tree` is the one page list to render for it, and `isCollection` says whether it collects any. Compare `entry.name` against `activeNavEntry.name` for the active state:

```hbs
{{#each this.docs.navEntries as |entry|}}
  <a
    href={{entry.href}}
    class={{if (eq entry.name this.docs.activeNavEntry.name) "active"}}
  >{{entry.name}}</a>
{{/each}}
```

`docs.tree` already accounts for this — it is the current group's page tree, or the collecting group's — so a sidebar built on it needs no change at all (`currentGroup.tree` is still the group's own). `availableGroups` and `selectedGroup` are deliberately untouched: they are how a _page_ is resolved (which group owns this URL, which group am I in), and a collecting group is not where a page lives. So a top-level nav built on `availableGroups` keeps working and keeps listing every group — `navEntries` is the switch that makes a collection visible.

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
