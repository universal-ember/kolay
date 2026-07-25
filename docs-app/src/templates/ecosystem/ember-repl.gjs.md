# ember-repl

[ember-repl](https://limber.glimdown.com/docs/ember-repl) (with [repl-sdk](https://limber.glimdown.com/docs/repl-sdk) underneath) is the compiler behind everything kolay renders:

- **`.md` pages** compile in the browser: `setupKolay()` configures an ember-repl compiler per application (your `remarkPlugins` / `rehypePlugins` / `topLevelScope` / `modules` feed straight into it), and [`selected`](/Runtime/utilities/selected.md) / [`compiledDoc`](/Runtime/rendering/compiled-doc.md) / [`Compiled`](/Runtime/rendering/compiled.md) all compile through it.
- **`.gjs.md` pages** compile at build time: the `docs()` plugin runs repl-sdk's markdown pipeline (the same one) in vite, so live codefences become real components in your bundle.
- **[Live codefences](/authoring/code-fences.md)** — the `live` / `preview` / `below` flags and the [render targets](/authoring/code-fences.md#render-targets) (gjs, hbs, jsx, svelte, vue, mermaid, …) are ember-repl / repl-sdk features; kolay configures which are allowed per compile mode.

## In tests

`setupKolay` from `kolay/test-support` wires the compiler up with `setupCompiler` from `ember-repl/test-support`, so rendering tests can compile markdown the same way the app does:

```js
import { setupKolay } from "kolay/test-support";

module("my docs", function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  // ...render <Page /> or Compiled(...) as usual
});
```
