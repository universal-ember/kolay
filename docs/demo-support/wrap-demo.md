# Wrapping demos

The opt-in `wrapDemos` plugin wraps every rendered demo (live code fence) in a component of your choosing, resolved from scope like any other component — so all your demos can share chrome (style isolation, a border, a "demo" label). The component is named by the required `componentName` option and receives the demo as its default block.

For example, wrapping every demo in [`<Shadowed>`](https://ember-primitives.pages.dev/5-floaty-bits/portal) from ember-primitives puts each demo in its own shadow DOM, so page styles and demo styles can't leak into each other.

For runtime-compiled `.md` pages, pass the plugin to `setupKolay` — `<Shadowed>` is already in the default `topLevelScope`:

```js
import { setupKolay } from "kolay/setup";
import { wrapDemos } from "kolay/wrap-demo";

// e.g. in your application route's model() hook
await setupKolay(this, {
  rehypePlugins: [[wrapDemos, { componentName: "Shadowed" }]],
});
```

(`.md` pages are compiled as glimdown, so `topLevelScope` applies to them — and to their `gjs`/`hbs` fences. Any component you bind in `topLevelScope` can be named instead.)

For build-time-compiled `.gjs.md` / `.gts.md` pages, pass the plugin to the `docs()` usage and bind the component in its `scope`:

```js
// vite.config.js
import { docs, wrapDemos } from "kolay/vite";

docs("MyDocs", {
  src: "...",
  rehypePlugins: [[wrapDemos, { componentName: "Shadowed" }]],
  scope: `import { Shadowed } from 'ember-primitives/components/shadowed';`,
});
```

## Choosing which demos are wrapped

The `eachDemo` option controls this, via words in the code fence meta (e.g. ```` ```gjs live shadow ````):

```js
[wrapDemos, {
  componentName: "Shadowed",
  eachDemo: {
    // 'always' (the default) wraps every demo;
    // 'opt-in' wraps only demos whose fence has the `meta` word
    behavior: "opt-in",
    // the word that opts a demo in (required for 'opt-in')
    meta: "shadow",
    // for either behavior: a word that skips wrapping for that demo
    exclude: "no-shadow",
  },
}],
```

Without the plugin, nothing is wrapped.
