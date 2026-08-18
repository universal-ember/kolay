# Wrapping demos

The `wrapDemos` plugin is optional. It puts every demo, which is a live code fence, inside a component that you choose. The plugin resolves that component from the scope, like any other component. All of your demos can then share the same markup: style isolation, a border, or a "demo" label. The necessary `componentName` option names the component. The component receives the demo as its default block. The examples below use `<Shadowed>` from ember-primitives, which renders its content in a shadow DOM.

A `.md` page compiles at runtime. Give the plugin to `setupKolay`, and put the component in `topLevelScope`. This explicit step lets you supply your own implementation, or set the arguments of the wrapper first:

```gjs
import { Shadowed } from "ember-primitives/components/shadowed";
import { setupKolay } from "kolay/setup";
import { wrapDemos } from "kolay/wrap-demos";

// e.g. in your application route's model() hook
await setupKolay(this, {
  rehypePlugins: [[wrapDemos, { componentName: "Shadowed" }]],
  topLevelScope: {
    Shadowed: <template>
      <Shadowed @includeStyles={{true}}>{{yield}}</Shadowed>
    </template>,
  },
});
```

A `.md` page compiles as glimdown, so `topLevelScope` applies to it. You can name any component that you put in `topLevelScope`.

A `.gjs.md` page compiles at build time. Give the plugin to the `docs()` usage, and put the component in its `scope`:

```js
// vite.config.js
import { docs } from "kolay/vite";
import { wrapDemos } from "kolay/wrap-demos";

docs("MyDocs", {
  src: "...",
  rehypePlugins: [[wrapDemos, { componentName: "Shadowed" }]],
  scope: `import { Shadowed } from 'ember-primitives/components/shadowed';`,
});
```

## Choosing which demos are wrapped

The `eachDemo` option controls this with words in the meta of the code fence, for example ```` ```gjs live shadow ````:

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

Without the plugin, kolay wraps no demo.
