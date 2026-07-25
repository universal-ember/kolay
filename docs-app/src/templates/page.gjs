import { DocPage } from './-doc-page.gjs';

/**
 * The Home (co-located) pages: plain, full-width landing layout.
 */
<template>
  <div class="home-doc" data-design="home">
    <DocPage />
  </div>

  <style scoped>
    .home-doc {
      flex: 1;
      padding: 1rem 0 4rem;
    }
  </style>
</template>
