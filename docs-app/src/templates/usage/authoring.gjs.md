# Authoring

Kolay supports two markdown file formats: `.md` and `.gjs.md`. Both can contain prose, code snippets, and live demos, but they differ in _when_ and _how_ they are compiled.

## `.md` — Runtime compiled

Plain `.md` files are shipped as raw text with your app's static assets. When a user navigates to a page backed by a `.md` file, kolay fetches the text and compiles it in the browser using `ember-repl`.

**Pros:**

- No build cost — adding more `.md` pages does not slow down your build
- Scales to any number of pages with a flat build time
- Great for large doc sites or monorepos with many packages

**Cons:**

- Slightly slower page transitions (compilation happens on each visit, though results are cached in an LRU)
- Live demos in `.md` codefences use the runtime compiler, so anything you want available in those demos must be provided through the `modules` and `topLevelScope` options passed to `setupKolay()`

### Example

````md
# My Page

Some prose here.

```gjs live
<template>Hello from a runtime-compiled demo!</template>
```
````

## `.gjs.md` — Build-time compiled

Files ending in `.gjs.md` are compiled during the build (via the `gjsmd` plugin inside `kolay()`). The markdown is converted to a GJS component at build time, much like a regular `.gjs` file. Live codefences become real component invocations in the output.

**Pros:**

- Instant page transitions — the compiled component is code-split and loaded like any other module
- Live demos are real GJS components, so you get full build-time error checking
- You can use the `scope` build option to make components/helpers available inside live codefences without any runtime setup

**Cons:**

- Each `.gjs.md` file adds to your build, so many of them can increase build times
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
kolay({
  groups: [
    {
      name: "Guides",
      src: "./docs/guides",
      // This directory can contain a mix of .md and .gjs.md files.
      // Kolay will handle each appropriately.
    },
  ],
});
```

This means you can choose the format per-page based on what makes sense: use `.gjs.md` for pages where you want build-time compilation, and `.md` for pages where you'd rather keep the build fast and defer to the browser.

## Links and images

Pages link to each other with regular markdown links, using root-absolute paths. A page's path is its group name followed by its location within the group's `src` directory (pages in the main app's templates have no group prefix):

```md
See the [setup guide](/usage/setup.md) for installation, or
[The DocsManager service](/Runtime/util/docs-manager.md).
```

Root-absolute paths are always written as if the app were deployed at `/`. When the app is served under a custom `rootURL` (a preview deploy at `/pr-1234/`, a docs site at `/my-lib/`, …), kolay rebases these paths onto the `rootURL` when the page compiles (in the browser for `.md` pages, at build time for `.gjs.md` pages) — authored content never needs to know where the app is deployed. This covers markdown link/image syntax as well as `href`/`src` attributes in raw inline HTML.

### Co-located images

Images can live next to the markdown files that use them and be referenced relatively:

```md
![The Ember Tomster](./ember-tomster.svg)
```

Kolay serves these co-located assets during development and copies them into the production build at the same URLs, so references work identically in both. Root-absolute references work too — an asset's URL is the group name followed by its path within the group's `src` directory (assets co-located with the main app's pages in `src/templates` / `app/templates` have no group prefix):

```md
![The Ember Tomster](/Runtime/sub-folder/ember-tomster.svg)
```

Recognized asset extensions (case-insensitive): `svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `avif`.
