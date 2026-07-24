# `compiledDoc`

Reactive load + compile + error state for a single document that you load yourself.

This is the same machinery that [`selected`](/Runtime/util/selected.md) (and therefore `<Page />`) uses for rendering the current page — extracted so that documents fetched any other way (`fetch`, `import()`, an API, inline strings, etc.) get the same behavior:

- markdown strings are compiled with your site-wide compiler configuration (remark / rehype plugins, top-level scope, extra modules)
- while a re-load is happening, the previously rendered document is kept — no flash of emptiness
- `settled()` in tests waits for the fetching and compiling to finish

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

The compiler is configured app-wide via [`setupKolay`](/usage/setup.md) (or `setupCompiler` from `ember-repl/test-support` in tests), so that must have run before a document loads — there is nothing to pass, link, or destroy per call site.

## The `load` function

The argument is a function that returns the document, in whichever of these shapes is convenient:

- a string of markdown (compiled in the browser)
- an already-compiled component
- a module whose `default` export is either of the above (e.g.: the result of `import('...')`)
- a `Promise` resolving to any of the above
- `undefined`, while there is nothing to load yet (the state stays pending)

The function is reactive: any tracked data read _synchronously_ (before the first `await`) will cause the document to re-load when that data changes — e.g. reading `this.args.slug` in the example above re-fetches when the slug changes.

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

If you already have the markdown synchronously and don't need the keep-latest behavior, the smaller [`Compiled`](/usage/rendering-pages.md) helper may be all you need.

## API Reference

<APIDocs @module="declarations/browser" @name="compiledDoc" @package="kolay" />
