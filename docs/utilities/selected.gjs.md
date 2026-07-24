# `selected`

Access the reactive state for the currently selected/visible page. This store resolves the current page from the URL, loads and compiles its document, and provides the rendered component.

This is what the `<Page />` component uses internally, and it is available directly for when you want to render the current page yourself.

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

## Rendering the current page yourself

`<Page />` is a thin wrapper around this store. If its three blocks don't give you enough control, you can use `selected` directly:

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

Note that `prose` can be present at the same time as `isPending` or `hasError`: while a new page is loading (or after it errored), the previously rendered page is kept, so navigation doesn't flash an empty screen.

To render a document that is _not_ the current page (something you fetched yourself), see [`compiledDoc`](/Runtime/rendering/compiled-doc.md).

## API Reference

<APIDocs @module="declarations/browser" @name="selected" @package="kolay" />
