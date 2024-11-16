import { describe, expect, test } from 'vitest';

import { extractTypesVersions } from './helpers.js';

describe('extractExports', () => {
  test('it works', () => {
    let result = extractTypesVersions({
      '*': {
        '*': ['declarations/index.d.ts'],
      },
    });

    expect(result).toMatchInlineSnapshot(`
      [
        "declarations/index.d.ts",
      ]
    `);
  });

  test('it includes multiple paths', () => {
    let result = extractTypesVersions({
      '*': {
        '*': ['declarations/index.d.ts'],
        'something/*': ['declarations/something/index.d.ts'],
      },
    });

    expect(result).toMatchInlineSnapshot(`
      [
        "declarations/index.d.ts",
        "declarations/something/index.d.ts",
      ]
    `);
  });
});
