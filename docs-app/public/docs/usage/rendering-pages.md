## Rendering Pages

The way this the docs app for Kolay renders pages looks like this:
```gjs
// app/templates/page.gjs
import { service } from 'ember-primitives/helpers';
import Route from 'ember-route-template';

function removeLoader() {
  document.querySelector('#kolay__loading')?.remove();
}

export default Route(
  <template>
    {{#let (service "kolay/docs") as |docs|}}

      <div>
        {{#if docs.selected.hasError}}
          <div style="border: 1px solid red; padding: 1rem;">
            {{docs.selected.error}}
          </div>
        {{/if}}

        {{#if docs.selected.prose}}
          <docs.selected.prose />
          {{(removeLoader)}}
        {{/if}}
      </div>

    {{/let}}
  </template>
);
```
