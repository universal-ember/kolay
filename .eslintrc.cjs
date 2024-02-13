'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const node = configs.node();

module.exports = {
  root: true,
  overrides: [
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
      files: ['src/browser/**/*'],
      rules: {
        'n/no-unpublished-import': 'off',
        'n/no-missing-import': 'off',
      },
    },
  ],
};
