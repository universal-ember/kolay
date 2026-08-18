# `docs(...)`

Kolay needs some static analysis at build time.

`docs(...)` is the only necessary plugin. It generates the navigation. It also generates the information that the runtime code of kolay uses to get the markdown documents from the static assets of the app. To generate api docs from the type declarations of your libraries, add the [`apiDocs(...)`][plugin-typedoc] plugin.

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

The second argument holds the markdown options for the group: `src`, `remarkPlugins`, `rehypePlugins`, and `scope`.

## `scope`

The `scope` option makes components, helpers, and other values available in a `.gjs.md` live code fence _at build time_. You do not import them in each code fence.

It is a string of import statements. The compiler puts the string at the top of every `.gjs.md` file. You can use everything that `scope` imports directly in an `hbs` or `gjs` live code fence.

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

With this config, every `.gjs.md` file can use `<APIDocs />`, `<Shadowed />`, or `<MyCustomComponent />` in a live code fence with no explicit import:

````md
# My Page

```hbs live
<Shadowed>
  <MyCustomComponent @foo="bar" />
</Shadowed>
```
````

> **Note:** `scope` applies only to a `.gjs.md` file, which compiles at build time. For a `.md` file, which compiles at runtime, use the `topLevelScope` option of `setupKolay()`.

## Conventions

You can collect the docs in two ways:

- Co-located pages. Kolay finds every page in `app/templates` and `src/templates` for you. These pages have no group, and they are served from the root URL space. This also happens when `docs()` gets no arguments.
- One group for each `docs()` usage. The `src` can point at a `docs` folder inside or outside your project. It can also point at the `components` folder of another package, and kolay finds all of the markdown there. This lets you keep the docs next to the code.

## Using the plugin multiple times

Use `docs()` one time for each group. Each usage can have its own markdown options: `remarkPlugins`, `rehypePlugins`, and `scope`:

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

All of the usages contribute to _one_ manifest. Every group appears in `docsManager` and `<GroupNav />`, as if one `docs()` call received them. The markdown options of a usage apply only to the `.gjs.md` files of that usage. So the `api` group above has `<APIDocs />` in scope, and the `guides` group does not.

A group name must be unique across all of the usages.

Then each group is mounted as its own route. Use the `addRoutes` of its virtual module. That function is scoped to the group. It brings all of the docs of the group into the route that calls it, whatever the path of that route is:

```js
// app/router.js
import { addRoutes as addGuidesRoutes } from "virtual:kolay/docs/guides";

Router.map(function () {
  this.route("help", function () {
    addGuidesRoutes(this); // /help/... serves the guides group
  });
});
```

The same thing at a lower level is `addRoutes(this, "guides")` from `kolay`. An `addRoutes(this)` with no group serves the group that the URL names. The path of the route must then be the same as the name of the group.

A scoped mount gets mount-space URLs everywhere. The links in `<PageNav />` and `<GroupNav />`, the active states, and the index redirects all use the URL of the mount, and not `/GroupName`. Every mount is its own route, so every mount can have its own route template. Each group can then have its own layout and design. The Runtime and TypeDoc sections of this site do this.

## Each group's virtual module

Every `docs()` usage enables a virtual module for its group. `docs('foo')` enables `virtual:kolay/docs/foo`:

```js
import { addRoutes as addFooRoutes, manifest } from "virtual:kolay/docs/foo";
```

- `addRoutes(context)` registers the routes of the group. It brings the docs of the group into the route that calls it. You can also write the router example above like this:

  ```js
  // app/router.js
  import { addRoutes as addGuidesRoutes } from "virtual:kolay/docs/guides";

  Router.map(function () {
    this.route("help", function () {
      addGuidesRoutes(this);
    });
  });
  ```

- `manifest` is the manifest of the group (`{ name, list, tree }`).
- `pages` holds the page loaders of the group, like `import.meta.glob`.
- `meta` tells you where the source is:

  ```js
  import { meta } from "virtual:kolay/docs/foo";

  meta.url; // the repository URL, e.g. 'https://github.com/universal-ember/kolay'
  meta.docsPath; // the repo-relative path to this source's docs, e.g. 'docs'
  ```

  `url` comes from the `repository` field of the `package.json` at the root of the repository. `docsPath` is the location of the `docs()` source in that repository. Together they can build an "edit this page" link.

  A `meta.jsonc` or `meta.json` file at the root of the source adds its content to `meta`. You can put any keys there, next to the derived fields. A key in the file replaces a derived field with the same name. This file can also hold the top-level [`order`](/development/ordering-pages.md) of the source, so that key comes with the others.

The co-located pages also have a virtual module: `virtual:kolay/docs/Home`. Its source is the templates directory, so `docsPath` and `meta.jsonc` refer to that directory.

Information about _all_ of the groups comes from the metamanifest, `kolay/compiled-docs:virtual`. It lists every group, and how to load the module of each group. `setupKolay()` loads all of the modules in parallel with `loadCompiledDocs` from `kolay`. By default, the navigation for the whole site is available immediately.

The types for these modules are in `kolay/virtual`. Add that entry to the `types` array of your tsconfig.

Add [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) to the route of each mount, for example `routes/help.js`. Then a visit to `/help` redirects to the first page in the group.

> **Note:** more than one usage works only with Vite. The usages find each other while vite resolves its config. The same applies to [`apiDocs()`](/TypeDoc/plugin/api-docs.md), where the usages merge their packages.
