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
 * The Runtime group: a guidebook.
 *
 * Prose-first: a paper-like sheet with a comfortable reading measure,
 * an eyebrow label, airy headings. Nothing here is shared with the
 * other groups' templates — each owns its whole design.
 * (Prose typography that must reach the rendered markdown is in
 *  app.css under `.runtime-doc`.)
 */
<template>
  <article class="runtime-doc" data-design="runtime">
    <div class="guide-sheet">
      <p class="guide-eyebrow" aria-hidden="true">Guide</p>

      <Page>
        <:pending>
          <div class="guide-loading" role="status">
            <span class="guide-loading__bar"></span>
            Preparing this guide…
          </div>
        </:pending>

        <:error as |error|>
          <aside class="guide-error" data-page-error role="alert">
            <strong>This page wandered off.</strong>
            {{#if (hasReason error)}}
              <p>{{error.reason}}</p>
              <details>
                <summary>Original error</summary>
                <pre>{{error.original.stack}}</pre>
              </details>
            {{else}}
              <p>{{error}}</p>
            {{/if}}
          </aside>
          {{(removeLoader)}}
        </:error>

        <:success as |Prose|>
          <Prose />
          {{(removeLoader)}}
        </:success>
      </Page>
    </div>
  </article>

  <style scoped>
    .runtime-doc {
      flex: 1;
      display: flex;
      padding: 1.5rem 0 4rem;
    }

    .guide-sheet {
      flex: 1;
      width: 100%;
      max-width: 78ch;
      margin-inline: auto;
      padding: 2rem 2.5rem 4rem;
      background: var(--pico-card-background-color);
      border: 1px solid var(--pico-muted-border-color);
      border-top: 0.35rem solid var(--pico-primary);
      border-radius: 0.75rem;
      box-shadow: var(--pico-card-box-shadow);
    }

    .guide-eyebrow {
      margin: 0 0 0.25rem;
      color: var(--pico-primary);
      font-size: 0.75rem;
      font-weight: bold;
      letter-spacing: 0.35em;
      text-transform: uppercase;
    }

    .guide-loading {
      display: grid;
      gap: 0.75rem;
      justify-items: start;
      padding: 3rem 0;
      color: var(--pico-muted-color);
      font-style: italic;
    }

    @keyframes guide-pulse {
      0%,
      100% {
        transform: scaleX(0.35);
        opacity: 0.5;
      }
      50% {
        transform: scaleX(1);
        opacity: 1;
      }
    }

    .guide-loading__bar {
      width: 12rem;
      height: 0.35rem;
      border-radius: 0.35rem;
      background: var(--pico-primary);
      transform-origin: left;
      animation: guide-pulse 1.6s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .guide-loading__bar {
        animation: none;
      }
    }

    .guide-error {
      margin: 2rem 0;
      padding: 1rem 1.25rem;
      border: 1px solid var(--pico-muted-border-color);
      border-left: 0.35rem solid var(--pico-del-color, #d32f2f);
      border-radius: 0.5rem;
      background: var(--pico-card-background-color);
    }

    @media (max-width: 960px) {
      .guide-sheet {
        padding: 1.5rem 1.25rem 3rem;
        border-radius: 0.5rem;
      }
    }
  </style>
</template>
