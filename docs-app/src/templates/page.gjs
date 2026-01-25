import Route from 'ember-route-template';
import { Page } from 'kolay/components';

function removeLoader() {
  requestAnimationFrame(() => {
    document.querySelector('#kolay__loading')?.remove();
  });
}

/**
 * If page with '.md' is detected, try to load it, if it doesn't exist,
 * redirect to real route without the .md.
 *
 * (this could probably be checked synchronously via the manifest)
 *
 * We may also need to remove the /index as well?
 */
export default Route(
  <template>
    <Page>
      <:pending>
        <div class="loading-page" role="status">
          Loading, compiling, etc
        </div>
      </:pending>

      <:error as |error|>
        <div style="border: 1px solid red; padding: 1rem;" data-page-error role="alert">
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
        top: 0rem;
        padding: 0.5rem 1rem;
        background: rgba(40, 40, 50, 0.9);
        filter: drop-shadow(0 0.5rem 0.5rem rgba(0, 0, 0, 0.8));
        color: white;
        right: 0;
        width: 100%;
        border-bottom-left-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
      }
    </style>

    <script>

      let foo = 2
    </script>
  </template>
);
