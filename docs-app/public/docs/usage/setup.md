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

## Setup

There are two areas of configuration needed: buildtime, and runtime.

### Build: Embroider + Webpack

import `kolay/webpack`

```js
const { createManifest, apiDocs } = await import("kolay/webpack");

return require("@embroider/compat").compatBuild(app, Webpack, {
  /* ... */
  packagerOptions: {
    webpackConfig: {
      devtool: "source-map",
      plugins: [createManifest({ src: "public/docs" }), apiDocs({ package: "kolay" })],
    },
  },
});
```

You can create docs for multiple libraries by invoking these plugins more than once:

```js
devtool: 'source-map',
plugins: [
  createManifest({ src: 'public/docs', name: 'own-manifest.json' }),
  apiDocs({ package: 'kolay' }),
  createManifest({ src: '../../my-library', name: 'my-library-manifest.json' }),
  apiDocs({ package: 'my-library' }),
],
```

See related for

- [createManifest(...)](/plugins/create-manifest.md)
- [apiDocs(...)](/plugins/api-docs.md)
- [All Build Plugins](/plugins/index.md)

### Runtime: Routing

If using `@ember/routing/router` or `@embroider/router`

You'll want to also install `ember-primitives`, so that you can use the [`@properLinks`] decorator on the router, giveng you the ability to _just use anchor tags (`<a>`)_ (a requirement for in-browser linking in markdown).

```js
import { kolayRoutes } from "kolay";
import { properLinks } from "ember-primitives/proper-links";

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  kolayRoutes(this);
});
```

In the spirit of dynamically compiled and discovered docs, this adds a `*wildcard` route that matches all paths and then tries to derive which file to load from there.
