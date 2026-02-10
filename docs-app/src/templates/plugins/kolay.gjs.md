# `kolay(...)`

Kolay requires some build-time static analysis to function.

`kolay(...)` is the only required plugin. This generates the navigation and information about how Kolay's runtime code will fetch the markdown documents deployed with the app's static assets. Optionally, if a list of packages is provided, apiDocs will be generated from your library's type declarations. Rendering these api docs uses the [Signature Components][ui-signature] or [`APIDocs`][ui-apiDocs] components.

[plugin-kolay]: /plugins/kolay.md
[ui-signature]: /Runtime/docs/component-signature.md
[ui-apiDocs]: /Runtime/docs/api-docs.md

Usage with Vite:

```js
// vite.config.js
import { kolay } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    kolay({
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
import { kolay } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    kolay({
      src: "public/docs",
      packages: ["my-library"],
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
