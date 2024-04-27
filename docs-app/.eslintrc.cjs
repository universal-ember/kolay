'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.ember();

module.exports = {
  root: true,
  overrides: [
    ...config.overrides,
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
      files: ['**/*.{cjs,js}'],
      rules: {
        'n/no-unsupported-features': 'off',
      },
    },
  ],
};
