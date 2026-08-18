# kolay.config.js

One config file describes your complete kolay setup. The `kolay` vite plugin reads the file. It then generates the [`docs()`](/development/configuring-docs.md), [`apiDocs()`](/development/configuring-api-docs.md), [`demos()`](/authoring/sharing-demos.md), and [`importEntrypoints()`](/development/configuring-import-entrypoints.md) plugins that the file describes:

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

`defineConfig` gives the config its types. It also validates the config while the file is evaluated. The [vite.config.js](https://github.com/universal-ember/kolay/blob/main/docs-app/vite.config.js) and [kolay.config.js](https://github.com/universal-ember/kolay/blob/main/docs-app/kolay.config.js) of this site use this form.

## Keys

Every key is optional. If you do not give a key, your app does not include the plugin for it. A relative path resolves from the directory of the config file. `redirects` has its own page: [Redirects](/development/redirects.md).

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

[lilconfig](https://github.com/antonk52/lilconfig) finds the file. It looks for `kolay.config.js` (or `.cjs` or `.mjs`), `.kolayrc` (JSON), `.kolayrc.json` (or `.js`, `.cjs`, `.mjs`), or a `"kolay"` key in `package.json`. Each of these can also be in a `.config/` or `config/` directory. `markdownOptions` usually holds plugin functions, so it needs a JS form. A JSON form can hold all of the other keys.

Each plugin also works on its own, or together with `kolay()`.
