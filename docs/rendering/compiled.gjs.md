# `Compiled`

A reactive resource that compiles a string of markdown you already have — using your site-wide compiler configuration (remark / rehype plugins, top-level scope, extra modules) — and gives back the compile state.

Where [`compiledDoc`](/Runtime/rendering/compiled-doc.md) manages a whole document lifecycle (async loading, keeping the previous document while a new one loads), `Compiled` is the smaller building block: string in, compile state out.

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

The argument may be the string itself, or a function returning one — a function is reactive: tracked data it reads causes re-compilation when that data changes.

## In templates

`Compiled` also works directly in templates:

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
