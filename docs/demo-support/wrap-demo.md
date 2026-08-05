# Wrapping demos

The opt-in `wrapDemos` plugin wraps every rendered demo (live code fence) in a `<WrapDemo>` component, resolved from scope like any other component — so all your demos can share chrome (a border, a "demo" label, reset styles). Your component receives the demo as its default block.

For runtime-compiled `.md` pages, pass the plugin to `setupKolay` and bind your component in `topLevelScope`:

```gjs
import { setupKolay } from "kolay/setup";
import { wrapDemos } from "kolay/wrap-demo";

// e.g. in your application route's model() hook
await setupKolay(this, {
  rehypePlugins: [wrapDemos],
  topLevelScope: {
    WrapDemo: <template>
      <div class="demo-frame">{{yield}}</div>
    </template>,
  },
});
```

(`.md` pages are compiled as glimdown, so `topLevelScope` applies to them — and to their `gjs`/`hbs` fences.)

For build-time-compiled `.gjs.md` / `.gts.md` pages, pass the plugin to the `docs()` usage and bind your component in its `scope`:

```js
// vite.config.js
import { docs, wrapDemos } from "kolay/vite";

docs("MyDocs", {
  src: "...",
  rehypePlugins: [wrapDemos],
  scope: `import { DemoFrame as WrapDemo } from '#src/demo-frame.gts';`,
});
```

Without a `WrapDemo` binding, the passthrough default from `kolay/wrap-demo` is used (for `.gjs.md`, its import is generated automatically — a scope that binds `WrapDemo` replaces it), and demos render unchanged. Without the plugin, nothing is wrapped at all.

## Using a different scope binding

To wrap demos in something already in scope under another name, tell the plugin which binding to use:

```js
rehypePlugins: [[wrapDemos, { componentName: "DemoFrame" }]],
```

Demos are then wrapped in `<DemoFrame>` — the name must be a capitalized identifier, and (unlike the `WrapDemo` default, which falls back to the passthrough) that binding must exist: in `topLevelScope` for `.md`, in the usage's `scope` for `.gjs.md`.
