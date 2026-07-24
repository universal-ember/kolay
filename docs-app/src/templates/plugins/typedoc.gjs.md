# `typedoc(...)`

Generates api docs (typedoc JSON) from your libraries' type declarations, and teaches the runtime how to fetch them. Rendering these api docs uses the [Signature Components][ui-signature] or [`APIDocs`][ui-apiDocs] components.

Requires the [`docs(...)`][plugin-docs] plugin to also be present.

[plugin-docs]: /plugins/docs.md
[ui-signature]: /Runtime/docs/component-signature.md
[ui-apiDocs]: /Runtime/docs/api-docs.md

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
    typedoc({
      // Packages to generate api docs for.
      // NOTE: these must all be declared in your project's package.json
      packages: ["my-library"],
    }),
  ],
});
```

## Options

- `packages` — the list of packages to generate typedoc JSON for
- `dest` — where the JSON files are served/emitted (default: `'docs'`)

In dev, the JSON is generated on demand when requested; in production builds, it is emitted into the app's dist.
