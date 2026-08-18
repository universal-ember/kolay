# Configuring `importEntrypoints(...)`

A fence in a `.md` file compiles at runtime. It resolves an import only from what `setupKolay()` gives it, so you usually maintain a [`modules` map](/install/index.md) by hand. For a complete package, `importEntrypoints()` does this work for you. It reads the `package.json#exports` of the package, and it gives every entrypoint to the runtime compiler.

```js
// vite.config.js
import { docs, importEntrypoints } from "kolay/vite";

export default {
  plugins: [docs(), importEntrypoints("ember-primitives")],
};
```

Now every `.md` live fence can import from each entrypoint of the package, with no `modules` configuration. This page is a `.md` file that compiles at runtime. The `setupKolay` of this site gives no entry for ember-primitives, so the fence below resolves only through `importEntrypoints`:

```gjs live preview
import { ExternalLink } from "ember-primitives";

<template>
  <ExternalLink href="https://github.com/universal-ember/kolay">
    resolved through importEntrypoints
  </ExternalLink>
</template>
```

The argument is a package name, which resolves from your project in the same way as the bundler resolves it. The argument can also be a path to a directory that holds a `package.json`. This helps with a package in a monorepo that is not published. Use the plugin one time for each package. The entrypoints of all of the usages merge into one map.

## What counts as an entrypoint

Every key of the `exports` of the package becomes an import specifier. The key `.` is the package name, and `./components` becomes `<name>/components`. A package with no `exports` supplies only its name.

A **wildcard key** (`./*`) is expanded. Kolay matches its target pattern (`./dist/*.js`) against the files of the package. It then checks every candidate with [resolve.exports](https://github.com/lukeed/resolve.exports), the same library that repl-sdk uses at runtime. The conditions, the key specificity, and the blocked entries behave the same as in the real resolution.

Kolay skips these for you:

- A **types-only entry**, because there is nothing to import at runtime, and a **blocked entry** (`null`).
- `./package.json` and the addon-main tooling entries.

## Excluding entrypoints

The bundler includes everything in the map, code-split and loaded when necessary. So you must leave out an entrypoint that cannot operate in the browser. `exclude` takes subpath keys, either exact or with a `*` at the end:

```js
importEntrypoints("kolay", {
  exclude: ["./vite", "./build*"], // node-only: the build plugins
});
```

## When to use it

- Use it for a package that the demos import often, usually the component library that the docs are about. For your own demo components, use [`demos()`](/authoring/sharing-demos.md). For a single value, use `topLevelScope`.
- Only a `.md` fence, which compiles at runtime, needs this. A `.gjs.md` fence resolves its imports through the build.
