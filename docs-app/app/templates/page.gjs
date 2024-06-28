import Route from 'ember-route-template';
import { Page } from 'kolay/components';

function removeLoader() {
  requestAnimationFrame(() => {
    document.querySelector('#kolay__loading')?.remove();
  });
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

      <:success as |Prose|>
        <Prose />
        {{(removeLoader)}}
      </:success>

    </Page>
  </template>
);
