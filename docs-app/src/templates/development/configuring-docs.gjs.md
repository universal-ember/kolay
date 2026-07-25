# `docs(...)`

Kolay requires some build-time static analysis to function.

`docs(...)` is the only required plugin. This generates the navigation and information about how Kolay's runtime code will fetch the markdown documents deployed with the app's static assets. To also generate api docs from your libraries' type declarations, add the [`apiDocs(...)`][plugin-typedoc] plugin.

> **Note:** `docs` + `typedoc` used to be one combined plugin, `kolay(...)`. That export still works (it composes the two), but is deprecated.

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

Each group can then be mounted as its own route. Pass the group's name to `addRoutes` to scope the mount — it brings all of that group's docs into the route it was called from, no matter what the route's path is:

```js
// app/router.js
import { addRoutes } from "kolay";

Router.map(function () {
  this.route("help", function () {
    addRoutes(this, "guides"); // /help/... serves the guides group
  });
  this.route("api", function () {
    addRoutes(this); // unscoped: the path must match the group's name
  });
});
```

Scoped mounts get mount-space URLs everywhere: `<PageNav />` / `<GroupNav />` links, active states, and index redirects all use the mount's URL rather than `/GroupName`.

Pair each mount with [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) in the mount's route (e.g. `routes/help.js`) so that visiting `/help` redirects to the first page in the group.

> **Note:** multiple usages are only supported with Vite (the usages discover each other while vite resolves its config). The same applies to [`apiDocs()`](/TypeDoc/plugin/api-docs.md), whose usages merge their packages.
