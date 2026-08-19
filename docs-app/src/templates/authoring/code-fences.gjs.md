# Code fences

Kolay provides functionality to display Markdown code fences in one of three ways:

1. Code Block with Code Highlighting
2. Injected Working Code Example (with no source code block shown)
3. Injected Working Code Example with visible source Code Block with Code Highlighting


Kolay uses [ember-repl](https://limber.glimdown.com/docs/ember-repl) and [repl-sdk](https://limber.glimdown.com/docs/repl-sdk) to inject live code examples.

These modes are toggled by using the following flags after the code block language on the opening line of the fence.

## `live`

The `live` flag replaces the code block with its output:

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

This flag shows both. The output is _above_ the code block.

````md
```gjs live preview
<template>an example with its source</template>
```
````

## `live preview below`

This flag shows both, with the output _below_ the code block.

## Render targets

A live fence is not limited to Ember. repl-sdk can render these fence languages:

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

The available targets depend on the compile mode:

- In a **`.gjs.md`** file, the build compiles the page. A live fence can be `gjs` or `hbs`. The fence compiles to a real component during the build, so the build finds the errors in it.
- In a **`.md`** file, the browser compiles the page, and every target above is available. The same applies to a code fence inside your JSDoc, which the [TypeDoc components](/TypeDoc/plugin/api-docs.md) show. A target that is not Ember gets its dependencies (react, svelte, vue, mermaid) only when a page needs them. A page loads only what it renders.

Kolay puts an `hbs` fence in a template for you. This is the fastest way to show a component invocation:

````md
```hbs live
<APIDocs @package="kolay" @module="declarations/browser" @name="selected" />
```
````

## What is in scope?

A live fence can `import` from every module your app can import from. You can also use components and helpers _without_ an import in each fence:

- For a `.gjs.md` file, use the [`scope` option of `docs()`](/development/configuring-docs.md). It is a string of import statements. The build puts the string at the top of every file.
- For a `.md` file, use the `topLevelScope` and `modules` options of `setupKolay()`. They give values and modules to the runtime compiler. The `modules` map holds every module that a runtime demo can import. Each library the demo imports, at any depth, resolves from this map, never from the module graph of the build. The Setup section of [Install](/install/index.md) shows the configuration.
- For a complete demo component, in either file type, use the [`demos()` plugin](/authoring/sharing-demos.md). It gives a directory of components an alias that a fence can import, and it configures the runtime compiler for you.
- For a complete npm package in a `.md` file, use the [`importEntrypoints()` plugin](/development/configuring-import-entrypoints.md). It takes every entrypoint from the `exports` of the package, and it configures the runtime compiler for you.

By default, the runtime scope has `<Shadowed>` (from `ember-primitives`) for style isolation. It also has the [TypeDoc components](/TypeDoc/plugin/api-docs.md): `<APIDocs>`, `<ComponentSignature>`, `<ModifierSignature>`, `<HelperSignature>`, and `<CommentQuery>`.

## Escaping

To show a code fence _about_ code fences, as this page does, put it in a fence with more backticks:

`````md
````md
```gjs live
<template>demo</template>
```
````
`````
