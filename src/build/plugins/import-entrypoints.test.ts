import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  entrypointsFromExports,
  parseImportEntrypointsArgs,
  resolvePackageJson,
} from './import-entrypoints.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');

describe('entrypointsFromExports', () => {
  it('maps subpath keys to specifiers', () => {
    expect(
      entrypointsFromExports('my-lib', {
        '.': { types: './declarations/index.d.ts', default: './dist/index.js' },
        './components': { default: './dist/components.js' },
        './utils': './dist/utils.js',
      })
    ).toEqual(['my-lib', 'my-lib/components', 'my-lib/utils']);
  });

  it('skips wildcards, tooling entries, types-only and blocked entries', () => {
    expect(
      entrypointsFromExports('my-lib', {
        '.': { default: './dist/index.js' },
        './*': { default: './dist/*.js' },
        './*.css': './dist/*.css',
        './package.json': './package.json',
        './addon-main.js': './addon-main.cjs',
        './types': { types: './declarations/types.d.ts' },
        './internal': null,
      })
    ).toEqual(['my-lib']);
  });

  it('understands string, bare-conditions, fallback-array, and missing exports', () => {
    expect(entrypointsFromExports('a', './dist/index.js')).toEqual(['a']);
    expect(entrypointsFromExports('b', { import: './dist/index.js' })).toEqual(['b']);
    expect(entrypointsFromExports('c', { '.': ['./dist/modern.js', './dist/legacy.js'] })).toEqual([
      'c',
    ]);
    expect(entrypointsFromExports('d', undefined)).toEqual(['d']);
  });

  it('honors exclude — exact keys and trailing-star prefixes', () => {
    expect(
      entrypointsFromExports(
        'kolay',
        {
          '.': { default: './dist/index.js' },
          './vite': { import: './src/build/vite.js' },
          './build': { import: './src/build/index.js' },
          './build/legacy': { default: './src/legacy.cjs' },
        },
        { exclude: ['./vite', './build*'] }
      )
    ).toEqual(['kolay']);
  });
});

describe('resolvePackageJson', () => {
  it('resolves an installed package by name', () => {
    const { name, exports } = resolvePackageJson('ember-primitives', repoRoot);

    expect(name).toBe('ember-primitives');
    expect(exports).toBeTruthy();
  });

  it('resolves a directory containing a package.json', () => {
    const { name } = resolvePackageJson(repoRoot, repoRoot);

    expect(name).toBe('kolay');
  });

  it('errors helpfully otherwise', () => {
    expect(() => resolvePackageJson('not-a-real-package-xyz', repoRoot)).toThrow(/Is it installed/);
    expect(() => resolvePackageJson('./not-a-real-dir-xyz', repoRoot)).toThrow(
      /could not find a package.json/
    );
  });
});

describe('parseImportEntrypointsArgs', () => {
  it('enumerates this repository, excluding the node-only entrypoints', () => {
    const { entrypoints } = parseImportEntrypointsArgs(repoRoot, {
      exclude: ['./vite', './build*', './virtual', './test-support', './private/*'],
    });

    expect(entrypoints).toMatchInlineSnapshot(`
      [
        "kolay",
        "kolay/components",
      ]
    `);
  });

  it.each([
    [undefined, undefined, /requires a package name/],
    ['', undefined, /requires a package name/],
    ['ember-primitives', { exclude: 'nope' }, /must be an array/],
    ['ember-primitives', { exclude: [1] }, /must be an array/],
  ])('rejects %s / %o', (input, options, message) => {
    // @ts-expect-error deliberately wrong shapes
    expect(() => parseImportEntrypointsArgs(input, options)).toThrow(message);
  });
});
