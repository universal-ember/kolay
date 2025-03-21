import { describe, expect, test } from 'vitest';

import { extractExports } from './helpers.js';

describe('extractExports', () => {
  describe('default', () => {
    test('no "default" is specified', () => {
      const result = extractExports(
        {
          '.': {
            types: 'declarations/index.d.ts',
          },
        },
        'default'
      );

      expect(result).toMatchInlineSnapshot(`
        []
      `);
    });

    test('it works on .', () => {
      const result = extractExports(
        {
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
        },
        'default'
      );

      expect(result).toMatchInlineSnapshot(`
        [
          "dist/index.d.ts",
        ]
      `);
    });

    test('it works on globs', () => {
      const result = extractExports(
        {
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
          './*': {
            types: 'declarations/*.d.ts',
            default: 'dist/*.d.ts',
          },
        },
        'default'
      );

      expect(result).toMatchInlineSnapshot(`
        [
          "dist/index.d.ts",
          "dist/*.d.ts",
        ]
      `);
    });
  });
  describe('types', () => {
    test('no types are specified', () => {
      const result = extractExports(
        {
          '.': {
            default: 'dist/index.d.ts',
          },
        },
        'types'
      );

      expect(result).toMatchInlineSnapshot(`
        []
      `);
    });

    test('it works on .', () => {
      const result = extractExports(
        {
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
        },
        'types'
      );

      expect(result).toMatchInlineSnapshot(`
        [
          "declarations/index.d.ts",
        ]
      `);
    });

    test('it works on globs', () => {
      const result = extractExports(
        {
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
          './*': {
            types: 'declarations/*.d.ts',
            default: 'dist/*.d.ts',
          },
        },
        'types'
      );

      expect(result).toMatchInlineSnapshot(`
        [
          "declarations/index.d.ts",
          "declarations/*.d.ts",
        ]
      `);
    });

    test('it works out of order', () => {
      const result = extractExports(
        {
          './*': {
            types: 'declarations/*.d.ts',
            default: 'dist/*.d.ts',
          },
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
        },
        'types'
      );

      expect(result).toMatchInlineSnapshot(`
        [
          "declarations/*.d.ts",
          "declarations/index.d.ts",
        ]
      `);
    });

    test('it works on nested conditions', () => {
      const result = extractExports(
        {
          './*': {
            development: {
              types: 'declarations/*.d.ts',
              default: 'dist/*.d.ts',
            },
            production: {
              types: 'declarations/production/*.d.ts',
              default: 'dist/production/*.d.ts',
            },
          },
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
        },
        'types'
      );

      expect(result, 'includes everything').toMatchInlineSnapshot(`
        [
          "declarations/*.d.ts",
          "declarations/production/*.d.ts",
          "declarations/index.d.ts",
        ]
      `);
    });

    test('when conditions are specified', () => {
      const result = extractExports(
        {
          './*': {
            development: {
              types: 'declarations/*.d.ts',
              default: 'dist/*.d.ts',
            },
            production: {
              types: 'declarations/production/*.d.ts',
              default: 'dist/production/*.d.ts',
            },
          },
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
        },
        'types',
        ['production']
      );

      expect(result, 'includes everything').toMatchInlineSnapshot(`
        [
          "declarations/production/*.d.ts",
          "declarations/index.d.ts",
        ]
      `);
    });

    test('when multiple conditions are specified', () => {
      const result = extractExports(
        {
          './*': {
            development: {
              types: 'declarations/*.d.ts',
              default: 'dist/*.d.ts',
            },
            production: {
              types: 'declarations/production/*.d.ts',
              default: 'dist/production/*.d.ts',
            },
          },
          '.': {
            types: 'declarations/index.d.ts',
            default: 'dist/index.d.ts',
          },
        },
        'types',
        ['production', 'development']
      );

      expect(result, 'includes everything').toMatchInlineSnapshot(`
        [
          "declarations/*.d.ts",
          "declarations/production/*.d.ts",
          "declarations/index.d.ts",
        ]
      `);
    });
  });
});
