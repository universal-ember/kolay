# ember-primitives

[Documentation](https://ember-primitives.pages.dev) · [GitHub](https://github.com/universal-ember/ember-primitives)

kolay uses several parts of ember-primitives, and it needs one of them:

## `@properLinks` (required)

Markdown renders plain `<a>` tags. The `@properLinks` decorator on your router makes a click on an anchor in the same app a router transition. This makes the links between docs pages work:

```js
import { properLinks } from "ember-primitives/proper-links";

@properLinks
export default class Router extends EmberRouter {
  /* ... */
}
```

## `<Shadowed>`

This component is in every live code fence by default, through the runtime scope. It renders its content in a shadow DOM. A demo then gets a clean style sandbox, so the page styles and the demo styles stay apart.

```hbs
<Shadowed>
  <MyDemoWithItsOwnStyles />
</Shadowed>
```

## `createStore`

The browser state of kolay is [`docsManager(...)`](/Runtime/utilities/docs-manager.md) and [`selected(...)`](/Runtime/utilities/selected.md). Both use `ember-primitives/store`. They are singletons that link to the owner, and you can reach them from any component. You write no service files.

## Color scheme

This site uses `ember-primitives/color-scheme` for its light and dark modes, with `sync()` and `colorScheme.current`. For example, it gives shiki the correct theme at runtime.
