# `kolay(...)`

Kolay requires some build-time static analysis to function.

`kolay(...)` is the only required plugin. This generates the navigation and information about how Kolay's runtime code will fetch the markdown documents deployed with the app's static assets. Optionally, if a list of packages is provided, apiDocs will be generated from your library's type declarations. Rendering these api docs uses the [Signature Components][ui-signature] or [`APIDocs`][ui-apiDocs] components.

[plugin-kolay]: /plugins/kolay.md
[ui-signature]: /Runtime/docs/component-signature.md
[ui-apiDocs]: /Runtime/docs/api-docs.md

Usage in embroider / webpack:

```js
// ember-cli-build.js

const { kolay } = await import("kolay/webpack");

return require("@embroider/compat").compatBuild(app, Webpack, {
  /* ... */
  packagerOptions: {
    webpackConfig: {
      /* ... */
      plugins: [kolay(/* Options, see below */)],
    },
  },
});
```

```hbs live no-shadow
<APIDocs @package="kolay" @module="declarations/plugins/types" @name="Options" />
```

## Conventions

There are a few ways you can collect docs:

- using `src`, these are your main docs, but they could also be your only docs. If you have a small project, this will provide the best experience for working with documentation as changes to this directory are (especially if using the recommended `public/docs` value), will automatically reload when changes are made.
- The `groups` option are where more freedom is provided. This can point at a `docs` folder in another folder in your project, or it can point at a `components` folder and the plugin will pick up all markdown files it finds in there. This can be useful for co-locating docs with their implementations.
