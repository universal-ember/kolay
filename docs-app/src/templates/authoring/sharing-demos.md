# Sharing demos

A live code fence works well for a small example. A real demo needs more: the same demo on several pages, editor support while you write it, and space for more than one component. The `demos()` plugin gives a directory of components an import alias that every live fence understands:

```js
// vite.config.js
import { demos, docs } from "kolay/vite";

export default {
  plugins: [docs(), demos(import.meta.resolve("./demos"), { as: "#demos/site" })],
};
```

Every file in the directory becomes importable under the `as` specifier, exactly as you wrote it. So `demos/counter.gjs` is `#demos/site/counter`:

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

This page is a `.md` file, so the fence above compiles in the browser. The import resolves through the runtime compiler with no [`modules` configuration](/install/index.md), because `setupKolay` gets every `demos()` alias for you. In a `.gjs.md` file, the same import compiles through the build, like any other module.

## Conventions

- The file extension is removed. You import `counter.gjs`, `counter.gts`, `counter.js`, and `counter.ts` all as `…/counter`.
- `as` can be any valid import URI. The `#` prefix is the [subpath-import](https://nodejs.org/api/packages.html#subpath-imports) convention of Node. It shows clearly that the specifier is not an npm package.
- An `index` file supplies its directory. `demos/index.gjs` is `#demos/site`, and `demos/forms/index.gjs` is `#demos/site/forms`.
- Use the plugin one time for each directory. Give each usage its own `as`.

To let a fence import a complete npm package, and not your own demo files, read [`importEntrypoints()`](/development/configuring-import-entrypoints.md).
