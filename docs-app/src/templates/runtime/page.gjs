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
 * The Runtime group: guide mode.
 *
 * No card, no box — the whole site shifts into a reading mode while
 * this route is active: a soft primary wash over the page, the side
 * nav restyled into a chapter list, and a centered measure for the
 * prose. The second, plain <style> below is intentionally unscoped — it
 * only exists in the document while this route is rendered, which is what
 * lets one route restyle the entire site. It has to come second:
 * ember-scoped-css only looks at the template's first <style> for the
 * `scoped` attribute, and silently drops any later scoped block.
 *
 * (Prose typography that must reach the rendered markdown is in app.css,
 *  under `[data-design="runtime"]` — the classes below are scoped to this
 *  file, so they can't name the compiled markdown.)
 */
<template>
  <article class="runtime-doc" data-design="runtime">
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
  </article>

  <style scoped>
    .runtime-doc {
      flex: 1;
      width: 100%;
      /* the content region fills the space next to the nav, same as
       * every other group — the reading measure is handled inside
       * (see the [data-design="runtime"] rules in app.css) */
      margin: clamp(0.25rem, 1.5vw, 1.5rem) 0 clamp(1.5rem, 3vw, 3rem);
      padding: clamp(1rem, 2.5vw, 2.5rem) clamp(0.7rem, 3.5vw, 3rem) clamp(2.5rem, 4vw, 4rem);
      /* the paper: an elevated sheet on the washed page */
      background: var(--pico-card-background-color);
      border: 1px solid color-mix(in oklab, var(--pico-muted-border-color), transparent 40%);
      border-radius: 0.75rem;
      box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
    }

    .guide-eyebrow {
      display: flex;
      align-items: center;
      gap: 1rem;
      /* the same reading measure app.css gives the prose */
      max-width: 75ch;
      margin: 0 0 1.5rem;
      color: var(--pico-primary);
      font-size: 0.72rem;
      font-weight: bold;
      letter-spacing: 0.35em;
      text-transform: uppercase;
    }

    .guide-eyebrow::after {
      content: "";
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, var(--pico-primary), transparent);
      opacity: 0.45;
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
  </style>

  {{! route-wide guide mode: active only while a Runtime page renders }}
  {{!-- prettier-ignore --}}
  <style>
    /* guide mode washes the whole page — a continuous tint, stronger at
     * the top, never returning to plain background (no hard band) */
    body:has([data-design="runtime"]) {
      background:
        linear-gradient(
          to bottom,
          color-mix(in oklab, var(--pico-background-color), var(--pico-primary) 7%),
          color-mix(in oklab, var(--pico-background-color), var(--pico-primary) 3%) 22rem
        )
        fixed;
    }

    .mobile-menu-wrapper__content.container {
      background: none;
    }

    /* the side nav becomes a chapter list */
    .big-layout aside nav {
      font-size: 0.9rem;

      & > ul > li {
        margin-bottom: 1.25rem;
        color: var(--pico-muted-color);
        font-size: 0.72rem;
        font-weight: bold;
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }

      ul ul {
        margin-top: 0.35rem;
        font-size: 0.9rem;
        letter-spacing: normal;
        text-transform: none;
      }

      a {
        display: block;
        padding: 0.2rem 0.6rem;
        border-radius: 0.4rem;
        font-weight: normal;
      }

      a:hover {
        background: color-mix(in oklab, var(--pico-background-color), var(--pico-primary) 8%);
        text-decoration: none;
      }

      a.active {
        background: color-mix(in oklab, var(--pico-background-color), var(--pico-primary) 14%);
        font-weight: bold;
      }
    }
  </style>
</template>
