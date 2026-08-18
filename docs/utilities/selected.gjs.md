# `selected`

This store holds the reactive state of the visible page. It resolves the current page from the URL. It then loads and compiles the document, and it supplies the component.

The `<Page />` component uses this store internally. You can also use the store directly, to render the current page yourself.

```js
import { selected } from 'kolay';

// inside a class with an owner
const current = selected(this);

current.prose;     // the rendered document (a component), if ready
current.isReady;   // finished loading + compiling?
current.isPending; // still loading / compiling?
current.hasError;  // did resolving the page, loading, or compiling fail?
current.error;     // a human-readable error message ('' when there is none)
current.hasProse;  // Boolean(current.prose)
current.doc;       // the underlying document state, a `CompiledDoc`
```

## Render the current page yourself

`<Page />` is a thin wrapper around this store. If its three blocks give you too little control, use `selected` directly:

```gjs
import Component from '@glimmer/component';
import { selected } from 'kolay';

export default class MyPage extends Component {
  get current() {
    return selected(this);
  }

  <template>
    {{#if this.current.hasError}}
      <div role="alert">{{this.current.error}}</div>
    {{else if this.current.isPending}}
      <div role="status">loading…</div>
    {{/if}}

    {{#if this.current.prose}}
      <this.current.prose />
    {{/if}}
  </template>
}
```

`prose` can be present with `isPending` or with `hasError`. While a new page loads, or after an error, the previous page stays on screen. The navigation does not show an empty screen.

To render a document that is _not_ the current page, and that you got yourself, read [`compiledDoc`](/Runtime/rendering/compiled-doc.md).

## API Reference

<APIDocs @module="declarations/browser" @name="selected" @package="kolay" />

The store `selected` returns:

<APIDocs @module="declarations/browser" @name="Selected" @package="kolay" />
