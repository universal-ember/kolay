# `compiledDoc`

This resource gives you the load state, the compile state, and the error state of one document that you load yourself.

[`selected`](/Runtime/utilities/selected.md), and therefore `<Page />`, uses the same code to render the current page. Kolay exports that code, so a document from any other source gets the same behavior. The source can be `fetch`, `import()`, an API, or a string in your code:

- A markdown string compiles with your site-wide compiler configuration: the remark plugins, the rehype plugins, the top-level scope, and the extra modules.
- During a new load, the previous document stays on screen. The page does not become empty.
- In a test, `settled()` waits for the fetch and the compile to finish.

```gjs
import Component from '@glimmer/component';
import { compiledDoc } from 'kolay';

export default class MyDocPage extends Component {
  doc = compiledDoc(() =>
    fetch(`/api/docs/${this.args.slug}.md`).then((response) => response.text())
  );

  <template>
    {{#if this.doc.hasError}}
      <div role="alert">{{this.doc.error}}</div>
    {{else if this.doc.isPending}}
      <div role="status">loading…</div>
    {{/if}}

    {{#if this.doc.prose}}
      <this.doc.prose />
    {{/if}}
  </template>
}
```

You configure the compiler for the whole app with [`setupKolay`](/install/index.md). In a test, use `setupCompiler` from `ember-repl/test-support`. This must happen before a document loads. At each call site, you pass nothing, you link nothing, and you destroy nothing.

## The `load` function

The argument is a function that returns the document. The return value can have any of these shapes:

- A string of markdown, which compiles in the browser.
- A component that is already compiled.
- A module with one of the two shapes above as its `default` export, for example the result of `import('...')`.
- A `Promise` that resolves to any of the shapes above.
- `undefined`, while there is nothing to load. The state then stays pending.

The function is reactive. It reads the tracked data _synchronously_, before the first `await`. The document then loads again each time that data changes. For example, the code above reads `this.args.slug`, so it fetches again when the slug changes.

## Example

```gjs live preview no-shadow
import { compiledDoc } from 'kolay';

// stand-in for a fetch() to somewhere
const doc = compiledDoc(() =>
  Promise.resolve(`Hello from **somewhere else**

\`\`\`hbs live
<p>even live codefences work</p>
\`\`\`
`)
);

<template>
  <fieldset>
    <legend>Demo</legend>

    {{#if doc.isPending}}
      loading…
    {{/if}}

    {{#if doc.prose}}
      <doc.prose />
    {{/if}}
  </fieldset>
</template>
```

You can have the markdown already, and you can also not need the keep-latest behavior. Then use the smaller [`Compiled`](/Runtime/rendering/compiled.md) helper.

## API Reference

<APIDocs @module="declarations/browser" @name="compiledDoc" @package="kolay" />
