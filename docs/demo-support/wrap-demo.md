# Wrapping demos

The opt-in `rehypeWrapDemos` plugin wraps every rendered demo (live code fence) in a `<WrapDemo>` component, resolved from scope like any other component — so all your demos can share chrome (a border, a "demo" label, reset styles). Your component receives the demo as its default block.

For runtime-compiled `.md` pages, pass the plugin to `setupKolay` and bind your component in `topLevelScope`:

```gjs
import { setupKolay } from "kolay/setup";
import { rehypeWrapDemos } from "kolay/wrap-demo";

// e.g. in your application route's model() hook
await setupKolay(this, {
  rehypePlugins: [rehypeWrapDemos],
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
import { docs, rehypeWrapDemos } from "kolay/vite";

docs("MyDocs", {
  src: "...",
  rehypePlugins: [rehypeWrapDemos],
  scope: `import { DemoFrame as WrapDemo } from '#src/demo-frame.gts';`,
});
```

Without a `WrapDemo` binding, the passthrough default from `kolay/wrap-demo` is used (for `.gjs.md`, its import is generated automatically — a scope that binds `WrapDemo` replaces it), and demos render unchanged. Without the plugin, nothing is wrapped at all.
