'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const node = configs.node();
const ember = configs.ember();

module.exports = {
  root: true,
  overrides: [
    /**
     ********************************
     * Node-land
     ********************************
     */
    ...node.overrides,
    {
      files: ['**/*.{ts,js}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['**/*.test.{ts,js}'],
      rules: {
        'n/no-unpublished-import': 'off',
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'n/no-unsupported-features/node-builtins': 'off',
        'n/no-missing-import': 'off',
      },
    },
    {
      files: ['src/browser/**/*', '**/*.test.ts', 'src/plugins/markdown-pages/types.ts'],
      rules: {
        'n/no-unpublished-import': 'off',
        'n/no-missing-import': 'off',
      },
    },
    /**
     ********************************
     * Browser-land
     ********************************
     */
    ...ember.overrides,
    {
      files: ['rollup.config.mjs'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.gts'],
      plugins: ['ember'],
      parser: 'ember-eslint-parser',
    },
    {
      files: ['**/*.gjs'],
      plugins: ['ember'],
      parser: 'ember-eslint-parser',
    },
    {
      files: ['**/*.ts', '**/*.gts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'n/no-unsupported-features/node-builtins': 'off',
      },
    },
    {
      files: ['**/*.cjs'],
      rules: {
        'n/no-unsupported-features': 'off',
      },
    },
  ],
};
