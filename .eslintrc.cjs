'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const node = configs.node();

module.exports = {
  root: true,
  overrides: [
    ...node.overrides,
    {
      files: ['**/*.test.{ts,js}'],
      rules: {
        'n/no-unpublished-import': 'off',
      },
    },
  ],
};
