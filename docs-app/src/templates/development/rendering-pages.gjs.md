## Rendering Pages

The way this the docs app for Kolay renders pages looks like this:

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

### Rendering the current page yourself

`<Page />` is a thin wrapper around the [`selected`](/Runtime/utilities/selected.md) store. If its blocks don't give you enough control (custom loading UI, combining states, extra chrome around the prose), you can use the store directly:

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

### Rendering documents you fetch yourself

The current-page behaviors (async loading, compiling with your site-wide config, keeping the previous document while a new one loads, test-`settled()` integration) are available for _any_ document via [`compiledDoc`](/Runtime/rendering/compiled-doc.md) — useful when your content comes from an API, a CMS, or a dynamic `import()`:

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

### Rendering a page within a page

If you want to render a page within a page, you can do that with the [`Compiled`](/Runtime/rendering/compiled.md) helper. This will use your site-wide configuration so all the remark plugins, rehype plugins, extra modules, etc will all be used when you use `Compiled`.

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
