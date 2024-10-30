'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

// accommodates: JS, TS, App, Addon, and V2 Addon
const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
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
