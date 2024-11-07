'use strict';

const { configBuilder: emberBuilder } = require('@nullvoxpopuli/eslint-configs/configs/ember');
const { configBuilder: nodeBuilder } = require('@nullvoxpopuli/eslint-configs/configs/node');
const { configFor, forFiles } = require('@nullvoxpopuli/eslint-configs/configs/-utils');

const ember = emberBuilder();
const node = nodeBuilder();

module.exports = configFor([
  // Browser / Runtime
  forFiles('src/browser/**/*.{gjs,js}', ember.modules.browser.js),
  forFiles('src/browser/**/*.{gts,ts}', ember.modules.browser.ts),
  forFiles('**/*.gts', { parser: 'ember-eslint-parser' }),
  forFiles('**/*.gjs', { parser: 'ember-eslint-parser' }),

  // Build
  forFiles('**/*.cjs', node.commonjs.js),
  forFiles('**/*.cts', node.commonjs.ts),
  forFiles('src/build/**/*.{js,mjs}', node.modules.js),
  forFiles(['src/build/**/*.{ts,mts}', 'src/types.ts'], node.modules.ts),

  // Supporting / internal
  forFiles('*.js', node.modules.js),
  forFiles('{vite,vitest}.config.ts', node.modules.ts),

  // Overrides
  forFiles('*.{gts,ts}', {
    rules: {
      // huge TODO
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),
  forFiles(['**/*.test.ts', '**/*.d.ts'], {
    rules: {
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': 'off',
    },
  }),
  forFiles('rollup.config.js', {
    rules: {
      'no-console': 'off',
    },
  }),
]);
