# Wrapping demos

Every rendered demo (live code fence) is wrapped in a `<WrapDemo>` component, resolved from scope like any other component. The default — exported from `kolay/wrap-demo` — renders the demo unchanged, so wrapping every demo in your own chrome (a border, a "demo" label, reset styles) is just a matter of binding your own `WrapDemo`, which receives the demo as its default block.

For runtime-compiled `.md` pages, bind it in `setupKolay`'s `topLevelScope`:

```gjs
import { setupKolay } from "kolay/setup";

// e.g. in your application route's model() hook
await setupKolay(this, {
  topLevelScope: {
    WrapDemo: <template>
      <div class="demo-frame">{{yield}}</div>
    </template>,
  },
});
```

(`.md` pages are compiled as glimdown, so `topLevelScope` applies to them — and to their `gjs`/`hbs` fences.)

For build-time-compiled `.gjs.md` / `.gts.md` pages, bind it in the `scope` option of the `docs()` plugin — when your scope binds `WrapDemo`, the generated import of the default is skipped in favor of yours:

```js
// vite.config.js
docs("MyDocs", {
  src: "...",
  scope: `import { DemoFrame as WrapDemo } from '#src/demo-frame.gts';`,
});
```

Without an override, demos render exactly as before.
