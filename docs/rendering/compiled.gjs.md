# `Compiled`

This reactive resource compiles a string of markdown that you have. It uses your site-wide compiler configuration: the remark plugins, the rehype plugins, the top-level scope, and the extra modules. It returns the compile state.

[`compiledDoc`](/Runtime/rendering/compiled-doc.md) manages the complete life of a document, with the async load and the previous document that stays on screen. `Compiled` is the smaller building block. A string goes in, and a compile state comes out.

```js
import { Compiled } from 'kolay';

class Demo {
  @use doc = Compiled(() => this.someMarkdown);
}

// this.doc.component  — the compiled component, once ready
// this.doc.isReady    — has compiling finished?
// this.doc.error      — the compile error, if there was one
// this.doc.reason     — a human-readable message for that error
```

The argument is the string, or a function that returns the string. A function is reactive. The resource compiles again each time the tracked data in that function changes.

## In templates

`Compiled` also works in a template:

```gjs live preview no-shadow
import { Compiled } from 'kolay';

const doc = `Hello from **a string**!`;

<template>
  <fieldset>
    <legend>Demo</legend>

    {{#let (Compiled doc) as |compiled|}}
      {{#if compiled.isReady}}
        <compiled.component />
      {{/if}}
    {{/let}}
  </fieldset>
</template>
```

## API Reference

<APIDocs @module="declarations/browser" @name="Compiled" @package="kolay" />

[ember-repl](/ecosystem/ember-repl) defines the state that `Compiled` returns:

<APIDocs @module="declarations" @name="CompileState" @package="ember-repl" />
