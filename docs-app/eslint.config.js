import { configs } from '@nullvoxpopuli/eslint-configs';

export default [
  ...configs.ember(import.meta.dirname),
  {
    files: ['**/*'],
    rules: {
      'import/no-unassigned-import': 'off',
      'ember/template-no-let-reference': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
