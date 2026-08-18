# ember-repl

[Documentation](https://limber.glimdown.com/docs/ember-repl) · [GitHub](https://github.com/NullVoxPopuli/limber) — repl-sdk: [Documentation](https://limber.glimdown.com/docs/repl-sdk)

ember-repl, with repl-sdk below it, is the compiler for everything that kolay renders:

- A **`.md` page** compiles in the browser. `setupKolay()` configures one ember-repl compiler for each application. Your `remarkPlugins`, `rehypePlugins`, `topLevelScope`, and `modules` go into that compiler. [`selected`](/Runtime/utilities/selected.md), [`compiledDoc`](/Runtime/rendering/compiled-doc.md), and [`Compiled`](/Runtime/rendering/compiled.md) all compile through it.
- A **`.gjs.md` page** compiles at build time. The `docs()` plugin operates the same markdown pipeline of repl-sdk inside vite, so a live code fence becomes a real component in your bundle.
- A **[live code fence](/authoring/code-fences.md)** uses features of ember-repl and repl-sdk. These are the `live`, `preview`, and `below` flags, and the [render targets](/authoring/code-fences.md#render-targets): gjs, hbs, jsx, svelte, vue, and mermaid. Kolay decides which targets each compile mode permits.

## In tests

`setupKolay` from `kolay/test-support` configures the compiler with `setupCompiler` from `ember-repl/test-support`. A rendering test then compiles markdown in the same way as the app:

```js
import { setupKolay } from "kolay/test-support";

module("my docs", function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  // ...render <Page /> or Compiled(...) as usual
});
```
