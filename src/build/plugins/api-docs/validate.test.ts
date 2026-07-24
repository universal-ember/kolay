import { describe, expect, test } from 'vitest';

import { validatePackages } from './validate.js';

// the repo root: `unplugin` and `ember-source` are installed here,
// and `./src` exists
const cwd = process.cwd();

describe('validatePackages', () => {
  test('accepts installed packages', () => {
    expect(() => validatePackages(['unplugin', 'kolay', '@glimmer/component'], cwd)).not.toThrow();
  });

  test('accepts installed packages whose exports have no importable "." entry', () => {
    expect(() => validatePackages(['ember-source'], cwd)).not.toThrow();
  });

  test('accepts a single string, normalizing to an array', () => {
    expect(validatePackages('unplugin', cwd)).toEqual(['unplugin']);
  });

  test('accepts relative paths that exist', () => {
    expect(() => validatePackages(['./src', '.'], cwd)).not.toThrow();
  });

  test('returns the entries as given', () => {
    expect(validatePackages(['unplugin', './src'], cwd)).toEqual(['unplugin', './src']);
  });

  test('rejects other shapes, explaining the expected ones', () => {
    expect(() => validatePackages({ packages: ['unplugin'] }, cwd)).toThrowError(
      /expects a package name or relative path, or an array of them/
    );
    expect(() => validatePackages(42, cwd)).toThrowError(/expects a package name/);
  });

  test('rejects packages that cannot be resolved, hinting at install', () => {
    expect(() => validatePackages(['not-a-real-dependency-xyz'], cwd)).toThrowError(
      /"not-a-real-dependency-xyz": could not be resolved from .*(\n|.)*install/
    );
  });

  test('rejects relative paths that do not exist', () => {
    expect(() => validatePackages(['./does-not-exist-xyz'], cwd)).toThrowError(
      /"\.\/does-not-exist-xyz": does not exist/
    );
  });

  test('rejects absolute paths, explaining they are not portable', () => {
    expect(() => validatePackages(['/etc/passwd'], cwd)).toThrowError(
      /absolute paths are not supported, because they are not portable between environments/
    );
  });

  test('rejects paths within packages (entry points come from package.json#exports)', () => {
    expect(() => validatePackages(['unplugin/dist'], cwd)).toThrowError(
      /"unplugin\/dist": paths within packages are not supported(.|\n)*Use "unplugin" instead/
    );
    expect(() => validatePackages(['@glimmer/component/dist/index'], cwd)).toThrowError(
      /Use "@glimmer\/component" instead/
    );
  });

  test('rejects non-string entries', () => {
    expect(() => validatePackages([42], cwd)).toThrowError(/every entry must be a string/);
  });

  test('reports every problem at once', () => {
    let message = '';

    try {
      validatePackages(
        ['unplugin', 'nope-xyz', './missing-xyz', 'unplugin/dist', '/absolute', 42],
        cwd
      );
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message.replaceAll(cwd, '<cwd>')).toMatchInlineSnapshot(`
      "typedoc() received invalid entries:
        - "nope-xyz": could not be resolved from <cwd>. Is it declared in your package.json, and have you run your package manager's install? (pnpm install / npm install / yarn install)
        - "./missing-xyz": does not exist (resolved to <cwd>/missing-xyz)
        - "unplugin/dist": paths within packages are not supported — type entry points are discovered from the package's package.json#exports. Use "unplugin" instead.
        - "/absolute": absolute paths are not supported, because they are not portable between environments — use a package name or a path relative to <cwd>
        - 42 (number): every entry must be a string"
    `);
  });
});
