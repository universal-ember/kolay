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

## Install[^type-module]

```bash
pnpm add kolay @universal-ember/kolay-ui
```

[^type-module]: `@universal-ember/kolay-ui` is only needed because due to a temporary technical problem. Once the ember ecosystem has broader `package.json#type=module` support for its own ember using libraries, `@universal-ember/kolay-ui` can be removed and there will only be `kolay`. Note that `package.json#type=module` support is already working and has worked for a good number of years for non-Ember libraries.

## Setup

There are two areas of configuration needed: buildtime, and runtime[^runtime-optional].

[^runtime-optional]: The runtime components are optional and if you don't import them, they will not be included in your app. However, since links generated from markdown use vanilla `<a>` tags, you'll probably want at least `@properLinks` from `ember-primitives`.

### Build: Embroider + Webpack

import `kolay/webpack`

```js
const { kolay } = await import("kolay/webpack");

return require("@embroider/compat").compatBuild(app, Webpack, {
  /* ... */
  packagerOptions: {
    webpackConfig: {
      devtool: "source-map",
      plugins: [
        kolay({
          src: "public/docs",
          // Generate API docs from JSDoc
          packages: ["kolay"],
        }),
      ],
    },
  },
});
```

You can create docs for multiple libraries at once:

```js
devtool: 'source-map',
plugins: [
  kolay({
    src: 'public/docs',
    groups: [
      {
        name: 'Runtime',
        src: '../ui/docs',
      },
    ],
    // Generate API docs from JSDoc
    // NOTE: these must all be declared in your projects package.json
    packages: ['kolay', 'ember-primitives', 'ember-resources'],
  }),
],
```

This is useful for monorepos where they may be scaling to large teams and many packages could end up being added quickly. In a traditionally compiled app, this may cause build times to slow down over time. Since many docs' sites are deployed continuously, that is wasted time and money spent on building things that may not be looked at all that often (we all wish folks looked at docs more!).

By distributing the rendering of pages to the browesr, we only pay for "build" when somenoe views the page.

### Runtime: Routing

If using `@ember/routing/router` or `@embroider/router`

You'll want to also install `ember-primitives`, so that you can use the [`@properLinks`] decorator on the router, giveng you the ability to _just use anchor tags (`<a>`)_ (a requirement for in-browser linking in markdown).

```js
import { addRoutes } from "kolay";
import { properLinks } from "ember-primitives/proper-links";

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  addRoutes(this);
});
```

In the spirit of dynamically compiled and discovered docs, this adds a `*wildcard` route that matches all paths and then tries to derive which file to load from there.

### Runtime: Rendering and Highlighting

Here is what this site does

- setup shiki for highlighting
  - installed as a rehype plugin
  - custom set of initially loaded syntaxes, for best experience
- mandatory setup (`apiDocs` and `manifest`)
- additional `resolve` entries for code blocks to pull from

```ts
// app/routes/application.ts
import Route from "@ember/routing/route";
import { setupKolay } from "kolay/setup";

import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { colorScheme, sync } from "ember-primitives/color-scheme";
import { getHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

sync();

import type { Manifest } from "kolay";

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const highlighter = await getHighlighterCore({
      themes: [import("shiki/themes/github-dark.mjs"), import("shiki/themes/github-light.mjs")],
      langs: [
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/glimmer-js.mjs"),
        import("shiki/langs/glimmer-ts.mjs"),
        import("shiki/langs/handlebars.mjs"),
        import("shiki/langs/jsonc.mjs"),
      ],
      loadWasm: getWasm,
    });

    const manifest = await setupKolay({
      resolve: {
        "ember-primitives": import("ember-primitives"),
        kolay: import("kolay"),
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
