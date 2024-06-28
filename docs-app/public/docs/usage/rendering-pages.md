## Rendering Pages

The way this the docs app for Kolay renders pages looks like this:

```gjs
// app/templates/page.gjs
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

If you want to render a page within a page, you can do that with the `Compiled` helper. This will use your site-wide configuration so all the remark plugins, rehype plugins, extra modules, etc will all be used when you use `Compiled`.

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
    fieldset { border: 1px solid #ccc; padding: 1rem; }
  </style>
</template>
```
