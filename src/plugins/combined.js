import { createUnplugin } from 'unplugin';

import { apiDocs } from './api-docs/index.js';
import { markdownPages } from './markdown-pages/index.js';
import { setup } from './setup.js';

export const combined = /* #__PURE__ */ createUnplugin(
  /**
   * @param {Parameters<typeof apiDocs>[0] & Parameters<typeof markdownPages>[0]} options
   */
  (options) => [
    setup(),
    apiDocs({ packages: options.packages, dest: options.dest }),
    markdownPages({ src: options.src, groups: options.groups, dest: options.dest }),
  ]
);
