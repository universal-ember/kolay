import { createUnplugin } from 'unplugin';

import { apiDocs } from './api-docs/index.js';
import { markdownPages } from './markdown-pages/index.js';
import { setup } from './setup.js';

export const combined = /* #__PURE__ */ createUnplugin(
  /**
   * @param {object} options
   */
  (options) => [setup(options), apiDocs(options), markdownPages(options)]
);
