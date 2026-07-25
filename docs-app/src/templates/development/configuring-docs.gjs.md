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
    docs({
      /* Options, see below */
    }),
  ],
});
```

```hbs live no-shadow
<APIDocs @package="kolay" @module="declarations/types" @name="Options" />
```

## `scope`

The `scope` option lets you make components, helpers, or other values available inside `.gjs.md` live codefences _at build time_, without needing to import them in each codefence.

This is a string of import statements that gets prepended to every `.gjs.md` file during compilation. Anything imported via `scope` can be used directly in `hbs` and `gjs` live codefences.

```js
// vite.config.js
import { docs } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    docs({
      src: "public/docs",
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

- using `src`, these are your main docs, but they could also be your only docs. If you have a small project, this will provide the best experience for working with documentation as changes to this directory are (especially if using the recommended `public/docs` value), will automatically reload when changes are made.
- The `groups` option are where more freedom is provided. This can point at a `docs` folder in another folder in your project, or it can point at a `components` folder and the plugin will pick up all markdown files it finds in there. This can be useful for co-locating docs with their implementations.

## Using the plugin multiple times

`docs()` may be used more than once in the same config — useful when different sources need different markdown processing (`remarkPlugins`, `rehypePlugins`, `scope`), or when you want each set of docs mounted as its own route.

```js
// vite.config.js
export default defineConfig({
  plugins: [
    docs({
      groups: [{ name: "guides", src: import.meta.resolve("./guides") }],
    }),
    docs({
      groups: [{ name: "api", src: import.meta.resolve("./api-docs") }],
      scope: `import { APIDocs } from 'kolay';`,
    }),
    // ...
  ],
});
```

All usages contribute to _one_ manifest: every group shows up in `docsManager`, `<GroupNav />`, etc, exactly as if they had been passed to a single `docs()` call. Each usage's markdown options apply to the `.gjs.md` files under that usage's `groups` — so the `api` group above gets `<APIDocs />` in scope while `guides` does not.

Group names must be unique across all usages.

Each group can then be mounted as its own route, where the route's path matches the group's name:

```js
// app/router.js
import { addRoutes } from "kolay";

Router.map(function () {
  this.route("guides", function () {
    addRoutes(this);
  });
  this.route("api", function () {
    addRoutes(this);
  });
});
```

Pair each mount with [`handlePotentialIndexVisit`](/Runtime/navigation/handle-potential-index-visit.md) in the mount's route (e.g. `routes/guides.js`) so that visiting `/guides` redirects to the first page in the group.

> **Note:** multiple usages are only supported with Vite (the usages discover each other while vite resolves its config). The same applies to [`apiDocs()`](/TypeDoc/plugin/api-docs.md), whose usages merge their packages.
