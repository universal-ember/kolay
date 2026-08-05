# Wrapping demos

Every rendered demo (live code fence) can be wrapped in a component of your choosing — for shared chrome like a border, a "demo" label, or reset styles — by passing `wrapDemo` to `setupKolay`. The component receives the demo as its default block:

```gjs
import { setupKolay } from "kolay/setup";

// e.g. in your application route's model() hook
await setupKolay(this, {
  wrapDemo: <template>
    <div class="demo-frame">{{yield}}</div>
  </template>,
});
```

The wrapper is global: it applies to every demo, on both runtime-compiled `.md` pages and build-time-compiled `.gjs.md` / `.gts.md` pages. Without `wrapDemo`, demos render exactly as before.

This works via `<WrapDemo>` from the `kolay/wrap-demo` module — both markdown pipelines emit it around each demo automatically, and at render time it resolves the component you configured (or renders the demo unchanged). You never invoke it yourself, but the module also exports `setDemoWrapper()` for custom setups that don't go through `setupKolay`.

Note for runtime-compiled `.md` pages: the wrapper must render its default block right away (no `{{#if}}` around `{{yield}}` that starts out false) — the demo is rendered into a placeholder element that needs to be in the DOM.
