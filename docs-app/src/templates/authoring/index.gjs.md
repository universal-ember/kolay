# Authoring

Docs are written in markdown. This section covers the two file formats, the [supported markdown features](/authoring/markdown-features.md), [live code fences](/authoring/code-fences.md) for interactive demos, [links and images](/authoring/links-and-images.md), and [extending markdown with plugins](/authoring/extending-markdown.md).

Kolay supports two markdown file formats: `.md` and `.gjs.md`. Both can contain prose, code snippets, and live demos, but they differ in _when_ and _how_ they are compiled.

## `.md` — Runtime compiled

Plain `.md` files are shipped as raw text with your app's static assets. When a user navigates to a page backed by a `.md` file, kolay fetches the text and compiles it in the browser using `ember-repl`.

**Pros:**

- No build cost — adding more `.md` pages does not slow down your build
- Scales to any number of pages with a flat build time
- Great for large doc sites or monorepos with many packages

**Cons:**

- Slightly slower page transitions (compilation happens on each visit, though results are cached in an LRU)
- Demo imports are not resolved by the build. The runtime compiler resolves imports only from what `setupKolay()` provides: every library your `.md` demos import — at any depth, including anything those libraries lead the demos to import — must be declared in `modules` (values can also be handed to the scope directly via `topLevelScope`). An import the map doesn't declare fails to resolve, even though the library sits installed in `node_modules`. The Setup section of [Install](/install/index.md) shows the map being configured; [`importEntrypoints()`](/development/configuring-import-entrypoints.md) maintains it for whole packages automatically.

### Example

````md
# My Page

Some prose here.

```gjs live
<template>Hello from a runtime-compiled demo!</template>
```
````

## `.gjs.md` — Build-time compiled

Files ending in `.gjs.md` are compiled during the build (by the `docs()` plugin). The markdown is converted to a GJS component at build time, much like a regular `.gjs` file. Live codefences become real component invocations in the output.

**Pros:**

- Instant page transitions — the compiled component is code-split and loaded like any other module
- Live demos are real GJS components, so you get full build-time error checking
- Demo imports resolve through the build, like any source file — anything installed works, at any depth, with no registration
- You can use the `scope` build option to make components/helpers available inside live codefences without any runtime setup

**Cons:**

- Every `.gjs.md` file adds compile work to the build — build time grows with your page count, where `.md` stays flat no matter how many pages exist
- Requires a build step; raw markdown content is not available at runtime

### Example

````md
# My Page

Some prose here.

```gjs live
<template>Hello from a build-time compiled demo!</template>
```
````

## Which should I use?

| Scenario                                                    | Recommendation                                  |
| ----------------------------------------------------------- | ----------------------------------------------- |
| Large doc site with many pages                              | `.md` — flat build cost                         |
| Pages with complex live demos that need build-time checking | `.gjs.md`                                       |
| Co-located component docs in a library                      | `.md` — no build overhead                       |
| Small doc site where build time isn't a concern             | Either works; `.gjs.md` gives faster page loads |

You can mix both formats in the same project. Use `.gjs.md` for pages where build-time compilation matters (e.g. your landing page or pages with many interactive demos) and `.md` for everything else.

## Mixing formats in the same group

Both `.md` and `.gjs.md` files can live side-by-side in the same `src` directory. Kolay handles them differently based on file extension:

- `.md` files are loaded as raw text and compiled at runtime in the browser
- `.gjs.md` files are compiled to GJS components at build time

```js
// This directory can contain a mix of .md and .gjs.md files.
// Kolay will handle each appropriately.
docs("Guides", { src: import.meta.resolve("./docs/guides") });
```

This means you can choose the format per-page based on what makes sense: use `.gjs.md` for pages where you want build-time compilation, and `.md` for pages where you'd rather keep the build fast and defer to the browser.
