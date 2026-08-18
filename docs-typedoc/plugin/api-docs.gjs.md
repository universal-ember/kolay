# `apiDocs(...)`

This plugin generates api docs, as typedoc JSON, from the type declarations of your libraries. It also tells the runtime how to get them. To render these api docs, use the [Signature Components][ui-signature] or the [`APIDocs`][ui-apiDocs] component.

The [`docs(...)`][plugin-docs] plugin must also be present.

[plugin-docs]: /development/configuring-docs.md
[ui-signature]: /TypeDoc/components/component-signature.md
[ui-apiDocs]: /TypeDoc/components/api-docs.md

Usage with Vite:

```js
// vite.config.js
import { docs, apiDocs } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    docs("guides", { src: import.meta.resolve("./guides") }),
    // Package names must be installed; relative paths must exist.
    apiDocs(["my-library", "./packages/my-other-library"]),
  ],
});
```

## Input

The plugin takes a string, or an array of strings. Each entry is one of these:

- A package name. The name must resolve from your project, so the package must be installed.
- A relative path. The path must exist on disk, and it resolves from the root of your project.

Kolay finds the type entry points in the `package.json#exports` of each package, from its `types` entries. So an entry always names a complete package:

- A path _inside_ a package (`my-library/dist/whatever`) is not permitted. Use the package name, and let `#exports` decide the entry points.
- An absolute path is not permitted, because it does not move between environments.
- A relative path must point at a package directory. Kolay uses its `package.json#exports`, as it does for a package name.

Kolay validates every entry when the config loads. It reports all of the problems together. If a package is missing, the message tells you to install your dependencies again.

In development, kolay generates the JSON when a page asks for it. In a production build, kolay writes the JSON into the dist folder of the app.
