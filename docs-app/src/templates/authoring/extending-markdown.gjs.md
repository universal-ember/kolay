# Extending markdown

The markdown pipeline is [unified](https://unifiedjs.com/): [remark](https://github.com/remarkjs/remark) plugins transform the markdown syntax tree, [rehype](https://github.com/rehypejs/rehype) plugins transform the resulting HTML tree. Kolay accepts both — anything from the remark/rehype ecosystems, or your own.

## Where plugins go

There are two compilers, one per [file format](/authoring/index.md):

- `.gjs.md` files compile at **build time** — plugins go in the [`docs()` build plugin](/development/configuring-docs.md):

  ```js
  // vite.config.js
  docs("guides", {
    src: import.meta.resolve("./guides"),
    remarkPlugins: [...],
    rehypePlugins: [...],
  }),
  ```

- `.md` files compile at **runtime** — plugins go in `setupKolay()`:

  ```js
  // routes/application.js
  await setupKolay(this, {
    remarkPlugins: [...],
    rehypePlugins: [...],
  });
  ```

If you use both formats, configure both places (usually with the same plugins) so pages behave the same regardless of format.

A plugin entry is either the plugin itself, or a `[plugin, options]` tuple:

```js
remarkPlugins: [myPlugin, [otherPlugin, { some: "option" }]],
```

## Example: syntax highlighting

Code fences have no highlighting out of the box. This site uses [shiki](https://shiki.style)'s rehype plugin — at build time:

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

and at runtime, with a pre-built highlighter so the browser only loads the languages it needs:

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

A plugin is a function returning a tree transformer — [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) does most of the walking:

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

Your plugins run alongside what kolay already does, so there's no need to add these yourself: [GFM and the other built-in features](/authoring/markdown-features.md), heading ids, [live code fence](/authoring/code-fences.md) extraction, and root-absolute link/image rebasing onto the app's `rootURL`.
