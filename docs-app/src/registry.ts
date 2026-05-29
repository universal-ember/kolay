import PageTitleService from 'ember-page-title/services/page-title';

import Router from './router.ts';

const appName = `docs-app`;

function formatAsResolverEntries(imports: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(imports).map(([k, v]) => [
      k
        .replace(/\.gjs\.md$/, '')
        .replace(/\.g?(j|t)s$/, '')
        .replace(/^\.\//, `${appName}/`),
      v,
    ])
  );
}

/**
 * A global registry is needed until:
 * - Services can be referenced via import paths (rather than strings)
 * - we design a new routing system
 */
const resolverRegistry = {
  // .gjs.md / .gts.md / .md files are loaded by kolay's Selected service via
  // dynamic imports from the `kolay/compiled-docs:virtual` pages map — they
  // don't need to live in Ember's resolver. Including them here as eager
  // imports forces every compiled-page chunk to evaluate at app boot, which
  // in the production SSR bundle creates a circular import: each chunk's
  // top-level `templateOnly()` call runs before app-ssr.js has initialized
  // the binding, throwing `templateOnly is not a function`.
  ...formatAsResolverEntries(import.meta.glob('./templates/**/*.{gjs,gts,js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./services/**/*.{js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./routes/**/*.{js,ts}', { eager: true })),
  [`${appName}/router`]: Router,
};

export const registry = {
  [`${appName}/services/page-title`]: PageTitleService,
  ...resolverRegistry,
};
