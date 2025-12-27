import PageTitleService from 'ember-page-title/services/page-title';

import Router from './router.ts';

const appName = `docs-app`;

import KolayPrivateService from 'kolay/private/😉 wut r u doin ❤️';

function formatAsResolverEntries(imports: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(imports).map(([k, v]) => [
      k.replace(/\.g?(j|t)s$/, '').replace(/^\.\//, `${appName}/`),
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
  ...formatAsResolverEntries(import.meta.glob('./templates/**/*.{gjs,gts,js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./services/**/*.{js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./routes/**/*.{js,ts}', { eager: true })),
  [`${appName}/router`]: Router,
  // No user would ever do this
  [`${appName}/services/kolay/-private/😉-wut-r-u-doin?-❤️`]: { default: KolayPrivateService },
};

export const registry = {
  [`${appName}/services/page-title`]: PageTitleService,
  ...resolverRegistry,
};
