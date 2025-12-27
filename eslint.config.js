import globals from 'globals';

import { configs } from '@nullvoxpopuli/eslint-configs';

export default [
  ...configs.ember(import.meta.dirname),
  {
    ignores: ['src/fake-glint-template.d.ts'],
  },
  {
    files: ['src/browser/**'],
    rules: {
      '@typescript-eslint/await-thenable': 'off',
    },
  },
  {
    files: ['src/build/**'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/test-support.ts'],
    rules: {
      'ember/no-test-support-import': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/test-support.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // TODO: they have a browser API now
  {
    files: ['**/typedoc/**'],
    rules: {
      'import/no-unassigned-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
];
