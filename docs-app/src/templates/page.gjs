import { Page } from 'kolay/components';

function removeLoader() {
  requestAnimationFrame(() => {
    document.querySelector('#kolay__loading')?.remove();
  });
}

function hasReason(error) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'reason' in error &&
    typeof error.reason === 'string'
  );
}

/**
 * If page with '.md' is detected, try to load it, if it doesn't exist,
 * redirect to real route without the .md.
 *
 * (this could probably be checked synchronously via the manifest)
 *
 * We may also need to remove the /index as well?
 */
<template>
  <Page>
    <:pending>
      <div class="loading-page" role="status">
        Loading, compiling, etc
      </div>
    </:pending>

    <:error as |error|>
      <div class="error" data-page-error role="alert">
        {{#if (hasReason error)}}
          {{error.reason}}
          <details>
            <summary>Original error</summary>
            <pre>{{error.original.stack}}</pre>
          </details>
        {{else}}
          {{error}}
        {{/if}}
      </div>
      {{(removeLoader)}}
    </:error>

    <:success as |Prose|>
      <Prose />
      {{(removeLoader)}}
    </:success>

  </Page>

  <style scoped>
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .error {
      margin-bottom: 2rem;
      border: 1px solid red;
      padding: 1rem;
    }
    .loading-page {
      position: fixed;
      top: 0rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(
        90deg,
        rgba(40, 40, 50, 0.9),
        rgba(60, 60, 70, 0.9),
        rgba(40, 40, 50, 0.9)
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
      filter: drop-shadow(0 0.5rem 0.5rem rgba(0, 0, 0, 0.8));
      color: white;
      right: 0;
      width: 100%;
      border-bottom-left-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }

    @media (prefers-reduced-motion: reduce) {
      .loading-page {
        animation: shimmer 10s infinite;
      }
    }
  </style>
</template>
