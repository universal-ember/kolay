## Rendering Pages

The way this the docs app for Kolay renders pages looks like this:

```gjs
// app/templates/page.gjs
import Route from 'ember-route-template';
import { Page } from 'kolay/components';

// Removes the App Shell / welcome UI 
// before initial rending and chunk loading finishes
function removeLoader() {
  document.querySelector('#kolay__loading')?.remove();
}

export default Route(
  <template>
    <div>
      <Page>

        <:error as |error|>
          <div style="border: 1px solid red; padding: 1rem;">
            {{error}}
          </div>
        </:error>

        <:success as |prose|>
          <prose />
          {{(removeLoader)}}
        </:success>

      </Page>
    </div>
  </template>
);
```
