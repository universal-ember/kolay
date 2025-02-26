// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import PageTitleService from 'ember-page-title/services/page-title';
import ResizeService from 'ember-resize-observer-service/services/resize-observer';
import { registry as kolayRegistry } from 'kolay';

import Router from './router.ts';

const appName = `docs-app`;

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
};

export const registry = {
  [`${appName}/services/resize-observer`]: ResizeService,
  [`${appName}/services/page-title`]: PageTitleService,
  ...resolverRegistry,
  ...kolayRegistry(appName),
};
