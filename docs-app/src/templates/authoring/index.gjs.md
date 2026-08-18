# Authoring

You write the docs in markdown. This section covers the two file formats. It also covers the [markdown features](/authoring/markdown-features.md), the [live code fences](/authoring/code-fences.md) for demos, the [links and images](/authoring/links-and-images.md), and [how to extend markdown with plugins](/authoring/extending-markdown.md).

Kolay supports two markdown file formats: `.md` and `.gjs.md`. Each format can hold prose, code snippets, and live demos. They differ in _when_ and _how_ they compile.

## `.md` — Runtime compiled

A plain `.md` file goes out as raw text with the static assets of your app. When a reader opens a page that comes from a `.md` file, kolay gets the text and compiles it in the browser with `ember-repl`.

**Pros:**

- No build cost. More `.md` pages do not make the build slower.
- The build time stays the same for any number of pages.
- This helps a large docs site, or a monorepo with many packages.

**Cons:**

- Page transitions are a little slower. The page compiles on each visit, but an LRU cache holds the results.
- The build does not resolve the imports of a demo. The runtime compiler resolves an import only from what `setupKolay()` gives it. Declare in `modules` every library that your `.md` demos import, at any depth. This includes the libraries that those libraries make the demos import. You can also give values to the scope with `topLevelScope`. An import that the map does not declare fails to resolve, even when the library is installed in `node_modules`. The Setup section of [Install](/install/index.md) shows the configuration of the map. [`importEntrypoints()`](/development/configuring-import-entrypoints.md) keeps the map correct for a complete package.

### Example

````md
# My Page

Some prose here.

```gjs live
<template>Hello from a runtime-compiled demo!</template>
```
````

## `.gjs.md` — Build-time compiled

The `docs()` plugin compiles a `.gjs.md` file during the build. The build converts the markdown into a GJS component, like a normal `.gjs` file. A live code fence becomes a real component invocation in the output.

**Pros:**

- Page transitions are immediate. The compiled component is code-split, and it loads like any other module.
- A live demo is a real GJS component, so the build finds the errors in it.
- The imports of a demo resolve through the build, like any source file. Every installed package works, at any depth, with no registration.
- The `scope` build option makes components and helpers available in a live code fence. No runtime setup is necessary.

**Cons:**

- Each `.gjs.md` file adds work to the build. The build time grows with the number of pages. With `.md`, the build time stays the same.
- The format needs a build step. The raw markdown is not available at runtime.

### Example

````md
# My Page

Some prose here.

```gjs live
<template>Hello from a build-time compiled demo!</template>
```
````

## Which format to choose

| Scenario                                                    | Recommendation                                  |
| ----------------------------------------------------------- | ----------------------------------------------- |
| Large doc site with many pages                              | `.md` — flat build cost                         |
| Pages with complex live demos that need build-time checking | `.gjs.md`                                       |
| Co-located component docs in a library                      | `.md` — no build overhead                       |
| Small doc site where build time is not a concern            | Either works. `.gjs.md` loads pages faster.     |

You can use both formats in the same project. Use `.gjs.md` for a page where build-time compilation is important, for example your landing page, or a page with many demos. Use `.md` for the other pages.

## Mixing formats in the same group

A `.md` file and a `.gjs.md` file can be together in the same `src` directory. Kolay uses the file extension to decide what to do:

- A `.md` file loads as raw text, and it compiles in the browser at runtime.
- A `.gjs.md` file compiles to a GJS component at build time.

```js
// This directory can contain a mix of .md and .gjs.md files.
// Kolay will handle each appropriately.
docs("Guides", { src: import.meta.resolve("./docs/guides") });
```

You can choose the format for each page. Use `.gjs.md` when you want build-time compilation. Use `.md` when you want a fast build, and the browser does the compile.
