import { createUnplugin } from 'unplugin';

import { apiDocs } from './api-docs/index.js';
import { gjsmd } from './gjs-md.js';
import { setup } from './setup.js';
import { fixViteForIssue362 } from './vite-issue-362.js';

/**
 * @typedef {import('./types.ts').Options} Options
 */

/**
 *
 * @param {Options} options
 * @type {import('unplugin').UnpluginFactory<Options>}
 */
export function combinedPlugins(options) {
  return [
    setup({
      groups: options.groups ?? [],
    }),
    apiDocs({ packages: options.packages ?? [], dest: options.dest }),
    fixViteForIssue362(),
    gjsmd({
      remarkPlugins: options.remarkPlugins,
      rehypePlugins: options.rehypePlugins,
      scope: options.scope,
    }),
  ].filter(Boolean);
}

export const combined = /* #__PURE__ */ createUnplugin(combinedPlugins);
