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
 * The TypeDoc group: a terminal.
 *
 * Reference material rendered inside terminal chrome — titlebar with
 * window dots, prompt-style loading, dense monospace-forward body.
 * Nothing here is shared with the other groups' templates — each owns
 * its whole design.
 * (Prose typography that must reach the rendered markdown is in app.css,
 *  under `[data-design="typedoc"] [data-prose]` — the classes below are
 *  scoped to this file, so they can't name the compiled markdown.)
 */
<template>
  <section class="typedoc-doc" data-design="typedoc">
    <div class="term">
      <header class="term__bar">
        <span class="term__dots" aria-hidden="true"><i class="term__dot--red"></i><i
            class="term__dot--blue"
          ></i><i class="term__dot--green"></i></span>
        <code class="term__title">kolay :: api reference — rendered from library types</code>
      </header>

      <div class="term__body" data-prose>
        <Page>
          <:pending>
            <pre class="term__loading" role="status">$ typedoc --render<span
                class="term__cursor"
              >▊</span></pre>
          </:pending>

          <:error as |error|>
            <pre class="term__error" data-page-error role="alert">$ typedoc --render
{{#if (hasReason error)}}error:
                {{error.reason}}

                {{error.original.stack}}{{else}}error: {{error}}{{/if}}
exit code 1</pre>
            {{(removeLoader)}}
          </:error>

          <:success as |Prose|>
            <Prose />
            {{(removeLoader)}}
          </:success>
        </Page>
      </div>
    </div>
  </section>

  <style scoped>
    .typedoc-doc {
      flex: 1;
      display: flex;
      padding: 1rem 0 3rem;
    }

    .term {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--pico-muted-border-color);
      border-radius: 0.6rem;
      overflow: hidden;
      background: var(--pico-code-background-color);
    }

    .term__bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.9rem;
      border-bottom: 1px solid var(--pico-muted-border-color);
      background: color-mix(in oklab, var(--pico-code-background-color), var(--pico-color) 6%);
    }

    .term__dots {
      display: inline-flex;
      gap: 0.4rem;
    }

    .term__dots i {
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 50%;
      background: var(--pico-muted-border-color);
    }

    .term__dot--red {
      background: var(--pico-del-color, #d32f2f);
      opacity: 0.66;
    }

    .term__dot--blue {
      background: var(--pico-primary);
      opacity: 0.66;
    }

    .term__dot--green {
      background: var(--pico-ins-color, #2e7d32);
      opacity: 0.66;
    }

    .term__title {
      background: none;
      padding: 0;
      color: var(--pico-muted-color);
      font-size: 0.78rem;
      letter-spacing: 0.03em;
    }

    .term__body {
      flex: 1;
      padding: clamp(1rem, 2vw, 1.25rem) clamp(0.7rem, 2vw, 1.5rem) 3rem;
    }

    .term__loading,
    .term__error {
      margin: 0;
      padding: 0.5rem 0;
      background: none;
      color: var(--pico-color);
    }

    .term__error {
      color: var(--pico-del-color, #d32f2f);
      white-space: pre-wrap;
    }

    @keyframes term-blink {
      0%,
      49% {
        opacity: 1;
      }
      50%,
      100% {
        opacity: 0;
      }
    }

    .term__cursor {
      animation: term-blink 1.1s steps(1) infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .term__cursor {
        animation: none;
      }
    }
  </style>
</template>
