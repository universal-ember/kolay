import { DocPage } from '../-doc-page.gjs';

/**
 * The TypeDoc group: reference layout — full width, with a banner
 * naming the section. Typography for the rendered prose is in app.css
 * under `.typedoc-doc`.
 */
<template>
  <div class="typedoc-doc" data-design="typedoc">
    <header class="typedoc-banner">
      <span class="typedoc-banner__chip">API</span>
      Reference — rendered from library types
    </header>

    <DocPage />
  </div>

  <style scoped>
    .typedoc-doc {
      flex: 1;
      padding: 0 0 6rem;
    }

    .typedoc-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1rem 0 1.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--pico-primary);
      border-left-width: 0.4rem;
      border-radius: 0.25rem;
      font-family: var(
        --pico-font-family-monospace,
        ui-monospace,
        "SFMono-Regular",
        Menlo,
        monospace
      );
      font-size: 0.85rem;
      letter-spacing: 0.02em;
    }

    .typedoc-banner__chip {
      padding: 0.05rem 0.5rem;
      border: 1px solid var(--pico-primary);
      border-radius: 0.25rem;
      color: var(--pico-primary);
      font-weight: bold;
      letter-spacing: 0.1em;
    }
  </style>
</template>
