# `typedoc(...)`

Generates api docs (typedoc JSON) from your libraries' type declarations, and teaches the runtime how to fetch them. Rendering these api docs uses the [Signature Components][ui-signature] or [`APIDocs`][ui-apiDocs] components.

Requires the [`docs(...)`][plugin-docs] plugin to also be present.

[plugin-docs]: /plugins/docs.md
[ui-signature]: /TypeDoc/components/component-signature.md
[ui-apiDocs]: /TypeDoc/components/api-docs.md

Usage with Vite:

```js
// vite.config.js
import { docs, typedoc } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    docs({
      /* ... */
    }),
    // Package names must be declared in your project's package.json;
    // relative paths must exist.
    typedoc(["my-library", "./packages/my-other-library"]),
  ],
});
```

## Input

The plugin receives an array of strings, where each entry is either

- a package name — it must be declared in your project's `package.json` (`dependencies`, `devDependencies`, or `peerDependencies`), or
- a relative path — it must exist on disk (resolved from your project's root)

Every entry is validated when the config is loaded, and all problems are reported at once.

In dev, the JSON is generated on demand when requested; in production builds, it is emitted into the app's dist.
