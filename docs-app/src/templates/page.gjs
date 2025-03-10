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
      <:pending>
        <div class="loading-page">
          Loading, compiling, etc
        </div>
      </:pending>

      <:error as |error|>
        <div style="border: 1px solid red; padding: 1rem;" data-page-error>
          {{error}}
        </div>
        {{(removeLoader)}}
      </:error>

      <:success as |Prose|>
        <Prose />
        {{(removeLoader)}}
      </:success>

    </Page>
    <style>
      .loading-page {
        position: fixed;
        top: 3rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.8);
        color: black;
      }
    </style>
  </template>
);
