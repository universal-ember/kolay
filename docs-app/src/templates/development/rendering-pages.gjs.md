## Rendering Pages

The docs app for Kolay renders its pages like this:

```gjs
// templates/page.gjs
import Route from "ember-route-template";
import { Page } from "kolay/components";

// Removes the App Shell / welcome UI
// before initial rending and chunk loading finishes
function removeLoader() {
  document.querySelector("#kolay__loading")?.remove();
}

export default Route(
  <template>
    <Page>

      <:error as |error|>
        <div style="border: 1px solid red; padding: 1rem;">
          {{error}}
        </div>
        {{(removeLoader)}}
      </:error>

      <:success as |prose|>
        <prose />
        {{(removeLoader)}}
      </:success>

    </Page>
  </template>,
);
```

### Render the current page yourself

`<Page />` is a thin wrapper around the [`selected`](/Runtime/utilities/selected.md) store. Its blocks can give you too little control: your own loading UI, a combination of states, or more markup around the prose. Then use the store directly:

```gjs
import Component from "@glimmer/component";
import { selected } from "kolay";

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

### Render a document that you get yourself

The behaviors of the current page are available for _any_ document through [`compiledDoc`](/Runtime/rendering/compiled-doc.md). These are the behaviors:

- the async load
- the compile with your site-wide config
- the previous document that stays on screen while a new one loads
- the `settled()` support in tests

Use `compiledDoc` when your content comes from an API, a CMS, or a dynamic `import()`:

```gjs
import Component from "@glimmer/component";
import { compiledDoc } from "kolay";

export default class MyDocPage extends Component {
  doc = compiledDoc(() =>
    fetch(`/api/docs/${this.args.slug}.md`).then((response) => response.text()),
  );

  <template>
    {{#if this.doc.prose}}
      <this.doc.prose />
    {{/if}}
  </template>
}
```

### Render a page inside a page

To render a page inside a page, use the [`Compiled`](/Runtime/rendering/compiled.md) helper. It uses your site-wide configuration, so `Compiled` applies all of your remark plugins, rehype plugins, and extra modules.

```gjs live preview no-shadow
import { Compiled } from "kolay";

// Maybe you got this content from an API
const page = `
  Hello World!

  Let's install Rust!

  \`\`\`bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  \`\`\`

  As recommended from [rust-lang.org](https://www.rust-lang.org/tools/install)
`;

<template>
  <fieldset><legend>Demo</legend>

    {{#let (Compiled page) as |compiled|}}
      {{#if compiled.component}}
        <compiled.component />
      {{/if}}
    {{/let}}

  </fieldset>

  <style>
    fieldset {
      border: 1px solid #ccc;
      padding: 1rem;
    }
  </style>
</template>
```
