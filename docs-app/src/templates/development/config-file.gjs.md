# kolay.config.js

One config file describes your whole kolay setup. The `kolay` vite plugin reads it and generates the [`docs()`](/development/configuring-docs.md), [`apiDocs()`](/development/configuring-api-docs.md), [`demos()`](/authoring/sharing-demos.md), and [`importEntrypoints()`](/development/configuring-import-entrypoints.md) plugins it describes:

```js
// vite.config.js
import { ember } from "@embroider/vite";
import { kolay } from "kolay/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [ember(), kolay()],
});
```

```js
// kolay.config.js
import { defineConfig } from "kolay/vite";

export default defineConfig({
  docs: [
    { name: "Runtime", src: import.meta.resolve("../docs") },
    // a plain string works too; the last segment names the group
    "./guides",
  ],

  apiDocs: ["my-library"],

  demos: [{ src: import.meta.resolve("./demos"), as: "#demos/site" }],

  importEntrypoints: ["ember-primitives"],

  redirects: [{ from: "old-section/*", to: "new-section/*" }],
});
```

`defineConfig` types the config and validates it as the file is evaluated. This site's own [vite.config.js](https://github.com/universal-ember/kolay/blob/main/docs-app/vite.config.js) and [kolay.config.js](https://github.com/universal-ember/kolay/blob/main/docs-app/kolay.config.js) use this form.

## Keys

Every key is optional. If a key isn't specified, the plugin for it is not included in your app. Relative paths resolve from the config file's directory, and `redirects` has its own page: [Redirects](/development/redirects.md).

### `KolayConfigInput`

<APIDocs @module="declarations/build/vite" @name="KolayConfigInput" @package="kolay" />

### `DocsEntry`

<APIDocs @module="declarations/build/vite" @name="DocsEntry" @package="kolay" />

### `MarkdownOptions`

<APIDocs @module="declarations/build/vite" @name="MarkdownOptions" @package="kolay" />

### `DemosEntry`

<APIDocs @module="declarations/build/vite" @name="DemosEntry" @package="kolay" />

### `ImportEntrypointsEntry`

<APIDocs @module="declarations/build/vite" @name="ImportEntrypointsEntry" @package="kolay" />

## `defineConfig`

<APIDocs @module="declarations/build/vite" @name="defineConfig" @package="kolay" />

## Config file forms

The file is discovered with [lilconfig](https://github.com/antonk52/lilconfig): `kolay.config.js` (or `.cjs` / `.mjs`), `.kolayrc` (JSON) or `.kolayrc.json` / `.js` / `.cjs` / `.mjs`, or a `"kolay"` key in `package.json`, each also inside a `.config/` or `config/` directory. `markdownOptions` usually contains plugin functions, so it needs a JS form; JSON forms can hold everything else.

The individual plugins keep working, alone or alongside `kolay()`.
