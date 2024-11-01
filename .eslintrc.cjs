'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const path = require('path');
const node = configs.node();
const ember = configs.ember();

function within(folder, configs) {
  return configs.map((config) => {
    if ('files' in config) {
      let files = Array.isArray(config.files) ? config.files : [config.files];
      return {
        ...config,
        files: files.map((filePattern) => {
          return path.join(folder, filePattern);
        }),
      };
    }

    // We probably shouldn't hit this,
    // everything should have files.
    return config;
  });
}

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
    within('browser', [
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
    ]),
  ].flat(),
};
