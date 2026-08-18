# Extending markdown

The markdown pipeline is [unified](https://unifiedjs.com/). A [remark](https://github.com/remarkjs/remark) plugin transforms the markdown syntax tree. A [rehype](https://github.com/rehypejs/rehype) plugin transforms the HTML tree that comes from it. Kolay accepts both kinds, from the remark and rehype ecosystems or from you.

## Where plugins go

There are two compilers, one for each [file format](/authoring/index.md):

- A `.gjs.md` file compiles at **build time**. Put the plugins in the [`docs()` build plugin](/development/configuring-docs.md):

  ```js
  // vite.config.js
  docs("guides", {
    src: import.meta.resolve("./guides"),
    remarkPlugins: [...],
    rehypePlugins: [...],
  }),
  ```

- A `.md` file compiles at **runtime**. Put the plugins in `setupKolay()`:

  ```js
  // routes/application.js
  await setupKolay(this, {
    remarkPlugins: [...],
    rehypePlugins: [...],
  });
  ```

If you use both formats, configure both places with the same plugins. Then a page behaves the same in each format.

A plugin entry is the plugin itself, or a `[plugin, options]` tuple:

```js
remarkPlugins: [myPlugin, [otherPlugin, { some: "option" }]],
```

## Example: syntax highlighting

A code fence has no highlighting by default. This site uses the rehype plugin of [shiki](https://shiki.style). At build time:

```js
// vite.config.js
import rehypeShiki from "@shikijs/rehype";

docs("guides", {
  src: import.meta.resolve("./guides"),
  rehypePlugins: [
    [rehypeShiki, { themes: { light: "github-light", dark: "github-dark" } }],
  ],
}),
```

At runtime, a pre-built highlighter makes the browser load only the languages it needs:

```js
// routes/application.js
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { createHighlighterCore } from "shiki/core";

const highlighter = await createHighlighterCore({
  themes: [import("shiki/themes/github-dark.mjs")],
  langs: [import("shiki/langs/javascript.mjs") /* ... */],
  engine: createOnigurumaEngine(() => import("shiki/wasm")),
});

await setupKolay(this, {
  rehypePlugins: [[rehypeShikiFromHighlighter, highlighter, { themes: { dark: "github-dark" } }]],
});
```

## Example: a custom plugin

A plugin is a function that returns a tree transformer. [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) walks the tree for you:

```js
import { visit } from "unist-util-visit";

function externalLinksInNewTabs() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      if (!String(node.properties?.href).startsWith("http")) return;

      node.properties.target = "_blank";
      node.properties.rel = "noopener noreferrer";
    });
  };
}

// a rehype plugin (it works on the HTML tree)
rehypePlugins: [externalLinksInNewTabs],
```

## What's already in the pipeline

Your plugins run together with the work that kolay does. Do not add these again:

- [GFM and the other built-in features](/authoring/markdown-features.md)
- the heading ids
- the extraction of a [live code fence](/authoring/code-fences.md)
- the rebase of root-absolute links and images onto the `rootURL` of the app
