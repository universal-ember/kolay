# ember-primitives

[Documentation](https://ember-primitives.pages.dev) · [GitHub](https://github.com/universal-ember/ember-primitives)

ember-primitives supplies several of the pieces kolay builds on — and one it requires:

## `@properLinks` (required)

Markdown renders plain `<a>` tags. The `@properLinks` decorator on your router turns same-app anchor clicks into router transitions, which is what makes links between docs pages work:

```js
import { properLinks } from "ember-primitives/proper-links";

@properLinks
export default class Router extends EmberRouter {
  /* ... */
}
```

## `<Shadowed>`

Available in every live codefence by default (via the runtime scope): renders its content inside shadow DOM, giving demos a clean style sandbox so page styles and demo styles can't leak into each other.

```hbs
<Shadowed>
  <MyDemoWithItsOwnStyles />
</Shadowed>
```

## `createStore`

Kolay's browser state — [`docsManager(...)`](/Runtime/utilities/docs-manager.md) and [`selected(...)`](/Runtime/utilities/selected.md) — is built on `ember-primitives/store`: owner-linked singletons you reach from any component, no service files required.

## Color scheme

This site's light/dark handling uses `ember-primitives/color-scheme` (`sync()` + `colorScheme.current`), e.g. for giving shiki the right theme at runtime.
