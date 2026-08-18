<h1 style="
  font-size: 2rem; 
  display: inline-block; 
  margin-bottom: 0; 
  padding-bottom: 0">kolay</h1> 
<small><code>adjective</code></small>

<ul style="margin: 0; padding-left: 1rem; padding-bottom: 0;">
    <li>easy</li>
    <li>simple</li>
    <li>uncomplicated</li>
</ul>

<small style="
  float: right; 
  margin-top: -2rem; 
  font-size: 0.5rem;">after initial setup</small>

<hr>

Documentation system for the `@universal-ember` family of projects.

## Install[^type-module]

```bash
pnpm add kolay
```

[^type-module]: this library sets `type: module` in its `package.json`. An ember project with this setting must use vite.

<details>
<summary>Trying unreleased changes (the <code>dist</code> branch)</summary>

Every push to `main` publishes the built package to the [`dist` branch](https://github.com/universal-ember/kolay/tree/dist). Install from that branch to try unreleased changes:

```bash
pnpm add kolay@github:universal-ember/kolay#dist
```

If other packages in the workspace also depend on `kolay`, use an override instead. An override also keeps your declared semver range as it is. Put the override in the root `package.json`:

```jsonc
{
  "pnpm": {
    "overrides": {
      "kolay": "github:universal-ember/kolay#dist",
    },
  },
}
```

The install resolves the branch to its current commit, then pins that commit in your lockfile. To get newer changes later, run `pnpm update kolay`. You can also remove the lockfile entry and install again.

</details>

### Use Markdown

- Write pages in any folder, in any project. This works well for a monorepo.
- The build time does not grow with the number of pages. The browser compiles each page when a reader opens it.
- Any code fence can become a live demo. Add the `live` tag. Ember, Mermaid, React, Svelte, Vue, [and more](https://limber.glimdown.com/docs/repl-sdk/) are supported.

  ````markdown
  Some prose here about the demo

  ```gjs live
  <template>interactive!</template>
  ```
  ````

### Use JSDoc

- The `<APIDocs />` component shows the docs that JSDoc and TypeDoc generate.

  ```markdown
  ## API Reference

  <APIDocs @package="my-library" @module="..." @name="theExport" />
  ```

- The examples in your JSDoc can be live demos:

  ````
  text here

  ```gjs live
  // the "live" tag on the codefence
  ```
  ````

### Navigation

- Kolay generates the navigation from the layout of your files.

## Setup

Kolay needs configuration in two places: the build, and the runtime[^runtime-optional].

[^runtime-optional]: The runtime components are optional. If you do not import them, your app does not include them. But markdown generates plain `<a>` tags, so most apps need at least `@properLinks` from `ember-primitives`.

### Build: Vite

import `kolay/vite`

```js
import { docs, apiDocs } from "kolay/vite";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      // Your main docs in "this" app: a "my-documentation" group
      docs(import.meta.resolve("./my-documentation")),
      // Optional: generate API Docs for packages listed here
      apiDocs(["kolay"]),
      // ...
    ],
  };
});

// ...
```

You can create docs for more than one library. Use `docs()` one time per group:

```js
docs(import.meta.resolve('./my-documentation')),
docs('UI', { src: import.meta.resolve('../ui/ui-guide', import.meta.url) }),
// Generate API docs from JSDoc
// NOTE: these must all be declared in your projects package.json
apiDocs(['kolay', 'ember-primitives', 'ember-resources']),
```

This helps a monorepo with a large team, where new packages arrive quickly. A traditional app compiles every page, so the build gets slower as the pages increase. Many docs sites deploy continuously. That build time costs time and money for pages that few readers open.

Kolay moves the render of a page to the browser. You pay for the compile of a page only when a reader opens it.

### Runtime: Routing

This applies to both `@ember/routing/router` and `@embroider/router`.

Install `ember-primitives`, then add the `@properLinks` decorator to your router. The decorator makes plain anchor tags (`<a>`) work as router links. Markdown links need this.

Add the routes through each group's own virtual module. The group name is the last segment of the folder, or the explicit first argument. So `docs(import.meta.resolve('./my-documentation'))` enables the module `virtual:kolay/docs/my-documentation`. Its `addRoutes` brings that group's docs into the route that calls it:

```js
import { addRoutes } from "kolay"; // for the co-located pages
import { addRoutes as addMyDocumentationRoutes } from "virtual:kolay/docs/my-documentation";
import { addRoutes as addUIGuideRoutes } from "virtual:kolay/docs/UI";
import { properLinks } from "ember-primitives/proper-links";

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // the co-located pages (app/templates, src/templates)
  addRoutes(this);

  // each group in its own mount — the mount's path is up to you, and
  // each mount can have its own route template (its own design!)
  this.route("docs", function () {
    addMyDocumentationRoutes(this);
  });

  this.route("ui", function () {
    addUIGuideRoutes(this);
  });
});
```

Each mount adds a `*wildcard` route. The route matches every path below the mount, and it gets the file to load from that path. A top-level `addRoutes(this)` serves _every_ group from the root URL space, if you do not need one mount per group.

A deploy under a custom `rootURL` works, for example a pull request preview at `/pr-1234/`. Kolay rebases the navigation, the redirects, and the root-absolute links and images in your markdown onto the `rootURL`. To learn how to write paths in your content, read [Links and images](/authoring/links-and-images.md).

### Runtime: Rendering and Highlighting

This site does the following:

- It sets up shiki for the highlighting.
  - shiki is installed as a rehype plugin.
  - It loads a chosen set of syntaxes at the start.
- It does the necessary setup (`apiDocs` and `manifest`).
- It adds more `resolve` entries for the code blocks to import from.

```ts
// routes/application.ts
import Route from "@ember/routing/route";
import { setupKolay } from "kolay/setup";

import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { colorScheme, sync } from "ember-primitives/color-scheme";
import { createHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

sync();

import type { Manifest } from "kolay";

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const highlighter = await createHighlighterCore({
      themes: [import("shiki/themes/github-dark.mjs"), import("shiki/themes/github-light.mjs")],
      langs: [
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/markdown.mjs"),
        import("shiki/langs/glimmer-js.mjs"),
        import("shiki/langs/glimmer-ts.mjs"),
        import("shiki/langs/handlebars.mjs"),
        import("shiki/langs/jsonc.mjs"),
      ],
      engine: createOnigurumaEngine(() => import("shiki/wasm")),
    });

    const manifest = await setupKolay(this, {
      modules: {
        "ember-primitives": () => import("ember-primitives"),
        kolay: () => import("kolay"),
      },
      rehypePlugins: [
        [
          rehypeShikiFromHighlighter,
          highlighter,
          {
            defaultColor: colorScheme.current === "dark" ? "dark" : "light",
            themes: {
              light: "github-light",
              dark: "github-dark",
            },
          },
        ],
      ],
    });

    return { manifest };
  }
}
```

### TypeScript

Add the TypeScript types to the `compilerOptions.types` array of your `tsconfig.json`.

```js
{
  "compilerOptions": {
    // ... other options
    "types": [
      "vite/client",
      "@embroider/core/virtual",
      "ember-source/types",
      //  add this 👇
      "kolay/virtual"
    ]
  }
}
```
