# Code fences

Any code fence can stay a plain, highlighted snippet — or become a live, rendered demo. Kolay uses [ember-repl](https://limber.glimdown.com/docs/ember-repl) / [repl-sdk](https://limber.glimdown.com/docs/repl-sdk) for this, and the flags below go after the language on the fence's opening line.

## `live`

Replaces the code block with its rendered output:

````md
```gjs live
<template>
  <button type="button">I am rendered!</button>
</template>
```
````

```gjs live
<template>
  <button type="button">I am rendered!</button>
</template>
```

## `live preview`

Shows both: the rendered output _above_ the code block.

````md
```gjs live preview
<template>an example with its source</template>
```
````

## `live preview below`

Shows both, with the rendered output _below_ the code block.

## Render targets

Live fences aren't limited to Ember. These are the fence languages repl-sdk can render:

| Language  | Renders with                                       |
| --------- | -------------------------------------------------- |
| `gjs`     | Ember / Glimmer                                    |
| `hbs`     | Ember / Glimmer (implicitly wrapped in a template) |
| `js`      | plain JavaScript                                   |
| `jsx`     | React                                              |
| `svelte`  | Svelte                                             |
| `vue`     | Vue                                                |
| `mermaid` | Mermaid (diagrams — no `live` flag needed)         |
| `md`      | Markdown (yes, markdown-in-markdown)               |
| `gmd`     | Glimmer-flavored markdown                          |

Where they work differs by compile mode:

- In **`.gjs.md`** files (build-time compiled), live fences may be `gjs` or `hbs`. They compile to real components during the build, so they get full build-time error checking.
- In **`.md`** files (runtime compiled) — and in codefences inside your JSDoc, rendered by the [TypeDoc components](/TypeDoc/plugin/api-docs.md) — the browser compiler is used, and all of the targets above are available. Non-Ember targets fetch their dependencies (react, svelte, vue, mermaid, …) on demand, so pages only pay for what they render.

An `hbs` fence is implicitly wrapped in a template, so it's the quickest way to demo component invocations:

````md
```hbs live
<APIDocs @package="kolay" @module="declarations/browser" @name="selected" />
```
````

## What's in scope?

Live fences can `import` from anything your app can import from. To use components or helpers _without_ importing them in every fence:

- for `.gjs.md` files: the [`scope` option of `docs()`](/development/configuring-docs.md) — a string of import statements prepended to every file at build time
- for `.md` files: the `topLevelScope` and `modules` options of `setupKolay()` — values and importable modules provided to the runtime compiler. The `modules` map is the complete import universe for runtime demos: every library they import, at any depth, resolves from it — never from the build's module graph. The Setup section of [Install](/install/index.md) shows it configured
- for whole demo components in either file type: the [`demos()` plugin](/authoring/sharing-demos.md) — a directory of components aliased for fences to import, wired into the runtime compiler automatically

By default, the runtime scope already provides `<Shadowed>` (from `ember-primitives`) for style isolation, and the [TypeDoc components](/TypeDoc/plugin/api-docs.md): `<APIDocs>`, `<ComponentSignature>`, `<ModifierSignature>`, `<HelperSignature>`, and `<CommentQuery>`.

## Escaping

To show a code fence _about_ code fences (like this page does), wrap it in a fence with more backticks:

`````md
````md
```gjs live
<template>demo</template>
```
````
`````
