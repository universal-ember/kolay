import { DocPage } from '../-doc-page.gjs';

/**
 * The Runtime group: guide-like reading layout — a centered column with
 * a comfortable measure. Typography for the rendered prose is in
 * app.css under `.runtime-doc`.
 */
<template>
  <div class="runtime-doc" data-design="runtime">
    <DocPage />
  </div>

  <style scoped>
    .runtime-doc {
      flex: 1;
      width: 100%;
      max-width: 75ch;
      margin-inline: auto;
      padding: 1.5rem 1rem 6rem;
      line-height: 1.7;
    }
  </style>
</template>
