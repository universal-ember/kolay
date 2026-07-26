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

Documentation system for the the `@universal-ember` family of projects.

## Install[^type-module]

```bash
pnpm add kolay
```

[^type-module]: this library sets `type: module` in its `package.json`, which for ember projects means that it requires vite.

### Use Markdown

- from any folder, any project (good for monorepos)
- scales infinitely with your project size, as compiling the pages is done on-demand, rather than on-deploy
- any codefence can become a live demo with the `live` tag (supports Ember, Mermaid, React, Svelte, Vue, [and more](https://limber.glimdown.com/docs/repl-sdk/))

  ````markdown
  Some prose here about the demo

  ```gjs live
  <template>interactive!</template>
  ```
  ````

### Use JSDoc

- JSDoc / TypeDoc is renderable via the `<APIDocs />` component

  ```markdown
  ## API Reference

  <APIDocs @package="my-library" @module="..." @name="theExport" />
  ```

- render examples from your jsdoc for interactive demonstration of concepts using

  ````
  text here

  ```gjs live
  // the "live" tag on the codefence
  ```
  ````

### Navigation

- generate navigation based on convention based file layout

## Setup

There are two areas of configuration needed: buildtime, and runtime[^runtime-optional].

[^runtime-optional]: The runtime components are optional and if you don't import them, they will not be included in your app. However, since links generated from markdown use vanilla `<a>` tags, you'll probably want at least `@properLinks` from `ember-primitives`.

### Build: Vite

import `kolay/vite`

```js
import { docs, apiDocs } from "kolay/vite";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      // Your main docs in "this" app: a "Docs" group
      docs(import.meta.resolve("./docs")),
      // Optional: generate API Docs for packages listed here
      apiDocs(["kolay"]),
      // ...
    ],
  };
});

// ...
```

You can create docs for multiple libraries at once — one `docs()` usage per group:

```js
docs(import.meta.resolve('./docs')),
docs('Runtime', { src: import.meta.resolve('../ui/docs', import.meta.url) }),
// Generate API docs from JSDoc
// NOTE: these must all be declared in your projects package.json
apiDocs(['kolay', 'ember-primitives', 'ember-resources']),
```

This is useful for monorepos where they may be scaling to large teams and many packages could end up being added quickly. In a traditionally compiled app, this may cause build times to slow down over time. Since many docs' sites are deployed continuously, that is wasted time and money spent on building things that may not be looked at all that often (we all wish folks looked at docs more!).

By distributing the rendering of pages to the browesr, we only pay for "build" when somenoe views the page.

### Runtime: Routing

If using `@ember/routing/router` or `@embroider/router`

You'll want to also install `ember-primitives`, so that you can use the [`@properLinks`] decorator on the router, giveng you the ability to _just use anchor tags (`<a>`)_ (a requirement for in-browser linking in markdown).

The primary way to add routes is through each group's own virtual module — `docs('docs')` (or `docs(import.meta.resolve('./docs'))`) enables `virtual:kolay/docs/docs`, whose `addRoutes` brings that group's docs into whatever route it's called from:

```js
import { addRoutes } from "kolay"; // for the co-located pages
import { addRoutes as addDocsRoutes } from "virtual:kolay/docs/docs";
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
    addDocsRoutes(this);
  });
});
```

Each mount adds a `*wildcard` route that matches all paths beneath it and derives which file to load from there. (`addRoutes(this)` at the top level also serves _every_ group from the root URL space, if you don't need per-group mounts.)

Deploying under a custom `rootURL` (e.g. a PR preview at `/pr-1234/`) is fully supported: navigation, redirects, and root-absolute links and images in authored markdown are all rebased onto the `rootURL` automatically. See [Links and images](/authoring/links-and-images.md) for how to write paths in your content.

### Runtime: Rendering and Highlighting

Here is what this site does

- setup shiki for highlighting
  - installed as a rehype plugin
  - custom set of initially loaded syntaxes, for best experience
- mandatory setup (`apiDocs` and `manifest`)
- additional `resolve` entries for code blocks to pull from

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
      resolve: {
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

Relevant typescript types can be installed via your tsconfig.json's compilerOptions.types,.

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
