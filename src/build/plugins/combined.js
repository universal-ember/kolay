import { createUnplugin } from 'unplugin';

import { apiDocs } from './api-docs/index.js';
import { markdownPages } from './markdown-pages/index.js';
import { setup } from './setup.js';

/**
 * @typedef {import('./types.ts').Options} Options
 */

/**
 *
 * @param {Options} options
 * @type {import('unplugin').UnpluginFactory<Options>}
 */
export function combinedPlugins(options, meta) {
  return [
    setup(),
    apiDocs({ packages: options.packages ?? [], dest: options.dest }),
    markdownPages({ src: options.src, groups: options.groups, dest: options.dest }),
  ];
}

export const combined = /* #__PURE__ */ createUnplugin(combinedPlugins);
