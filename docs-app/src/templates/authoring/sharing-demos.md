# Sharing demos

Live codefences are great for small examples, but real demos outgrow them: you want the same demo on several pages, editor tooling while writing it, and room for more than one component. The `demos()` plugin gives a directory of components an import alias every live fence understands:

```js
// vite.config.js
import { demos, docs } from "kolay/vite";

export default {
  plugins: [docs(), demos(import.meta.resolve("./demos"), { as: "#demos/site" })],
};
```

Every file in the directory becomes importable under the `as` specifier, used verbatim — `demos/counter.gjs` is `#demos/site/counter`:

````md
```gjs live
import Counter from "#demos/site/counter";

<template><Counter /></template>
```
````

That exact fence, live:

```gjs live preview
import Counter from "#demos/site/counter";

<template><Counter /></template>
```

This page is a `.md` file, so the fence above compiles in the browser — the import resolves through the runtime compiler with no [`modules` configuration](/install/index.md): `setupKolay` learns every `demos()` alias automatically. In `.gjs.md` files the same import compiles through the build, like any other module.

## Conventions

- File extensions are dropped: `counter.gjs`, `counter.gts`, `counter.js`, and `counter.ts` are all imported as `…/counter`
- `as` may be any valid import URI; the `#` prefix (Node's [subpath-import](https://nodejs.org/api/packages.html#subpath-imports) convention) makes it unmistakably not-an-npm-package
- An `index` file provides its directory: `demos/index.gjs` is `#demos/site`, and `demos/forms/index.gjs` is `#demos/site/forms`
- Use the plugin once per directory, each usage with its own `as`

For letting fences import an entire npm package (rather than your own demo files), see [`importEntrypoints()`](/development/configuring-import-entrypoints.md).
