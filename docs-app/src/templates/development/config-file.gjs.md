# kolay.config.js

One config file can describe your whole kolay setup. The `kolay` vite plugin reads it and generates the [`docs()`](/development/configuring-docs.md), [`apiDocs()`](/development/configuring-api-docs.md), [`demos()`](/authoring/sharing-demos.md), and [`importEntrypoints()`](/development/configuring-import-entrypoints.md) plugins it describes:

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
import rehypeShiki from "@shikijs/rehype";
import { defineConfig } from "kolay/vite";

export default defineConfig({
  // shared by every docs group; a group's own options win
  markdownOptions: {
    rehypePlugins: [[rehypeShiki, { themes: { light: "github-light", dark: "github-dark" } }]],
    scope: `import { Callout } from '#ui';`,
  },

  docs: [
    { name: "Runtime", src: "../docs" },
    // a plain string works too; the last segment names the group
    "./guides",
  ],

  apiDocs: ["my-library"],

  demos: [{ src: "./demos", as: "#demos/site" }],

  importEntrypoints: ["ember-primitives"],

  redirects: [{ from: "old-section/*", to: "new-section/*" }],
});
```

`defineConfig` is an identity function that types the config, so your editor completes and checks the keys.

This site is set up this way: its [vite.config.js](https://github.com/universal-ember/kolay/blob/main/docs-app/vite.config.js) is the one-plugin form, and its [kolay.config.js](https://github.com/universal-ember/kolay/blob/main/docs-app/kolay.config.js) carries the groups, api docs, demos, import entrypoints, and redirects.

## Keys

Every key is optional. With no `docs` entries, `kolay()` still serves the co-located pages (`app/templates` / `src/templates`) and the virtual modules `setupKolay` needs.

| Key                 | Generates                           | Shape                                                  |
| ------------------- | ----------------------------------- | ------------------------------------------------------ |
| `docs`              | one `docs()` per entry              | `{ name, src, ...markdown options }`, or a path string |
| `apiDocs`           | `apiDocs()`                         | package names / paths                                  |
| `demos`             | one `demos()` per entry             | `{ src, as }`                                          |
| `importEntrypoints` | one `importEntrypoints()` per entry | a package name, or `{ input, exclude }`                |
| `markdownOptions`   | (merged into every `docs` entry)    | `scope`, `remarkPlugins`, `rehypePlugins`, ...         |
| `redirects`         | (carried on the manifest)           | see [Redirects](/development/redirects.md)             |

Relative paths (`./demos`, `../docs`) resolve from the config file's directory.

## Config file forms

The file is discovered with [lilconfig](https://github.com/antonk52/lilconfig): `kolay.config.js` (or `.cjs` / `.mjs`), `.kolayrc` (JSON) or `.kolayrc.json` / `.js` / `.cjs` / `.mjs`, or a `"kolay"` key in `package.json`, with every form also looked for inside a `.config/` or `config/` directory.

`markdownOptions` (and a docs entry's own markdown options) usually carry plugin functions, so they need a JS config form. JSON forms can hold everything else.

## Mixing with the individual plugins

The individual plugins keep working, on their own or alongside `kolay()`. Usages discover each other the same way multiple direct `docs()` usages already do, so you can keep one group in the config file and add another with `docs()` directly.
