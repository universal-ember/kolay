# Configuring `importEntrypoints(...)`

Runtime-compiled `.md` fences resolve imports only from what `setupKolay()` provides — normally that means hand-maintaining a [`modules` map](/install/index.md). For whole packages, `importEntrypoints()` does it for you: it enumerates the package's `package.json#exports` and teaches the runtime compiler every entrypoint.

```js
// vite.config.js
import { docs, importEntrypoints } from "kolay/vite";

export default {
  plugins: [docs(), importEntrypoints("ember-primitives")],
};
```

Now any `.md` live fence can import from any of the package's entrypoints, with no `modules` configuration. This page is itself a runtime-compiled `.md` file, and this site's `setupKolay` passes no entry for ember-primitives — the fence below resolves purely through `importEntrypoints`:

```gjs live preview
import { ExternalLink } from "ember-primitives";

<template>
  <ExternalLink href="https://github.com/universal-ember/kolay">
    resolved through importEntrypoints
  </ExternalLink>
</template>
```

The argument is a package name (resolved from your project, exactly like the bundler will) or a path to a directory containing a `package.json` — useful for unpublished packages in a monorepo. Use the plugin once per package — the usages' entrypoints merge into one map.

## What counts as an entrypoint

Every key of the package's `exports` becomes an import specifier — `.` is the package name, `./components` becomes `<name>/components`. A package without `exports` provides just its name.

Skipped automatically:

- **wildcard keys** (`./*`) — they can't be enumerated from the keys alone
- **types-only entries** (nothing to import at runtime) and **blocked entries** (`null`)
- `./package.json` and the addon-main tooling entries

## Excluding entrypoints

Everything in the map gets bundled (lazily, code-split) — so entrypoints that can't run in the browser must be left out. `exclude` takes subpath keys, exact or ending in `*`:

```js
importEntrypoints("kolay", {
  exclude: ["./vite", "./build*"], // node-only: the build plugins
});
```

## When to reach for it

- A package the demos use _pervasively_ — the component library the docs are for, most likely. For your own demo components, [`demos()`](/authoring/sharing-demos.md) is the sharper tool; for one-off values, `topLevelScope`.
- Only `.md` (runtime-compiled) fences need any of this — `.gjs.md` fences resolve imports through the build already.
