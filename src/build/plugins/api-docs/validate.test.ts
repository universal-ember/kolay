import { describe, expect, test } from 'vitest';

import { validatePackages } from './validate.js';

// the repo root: its package.json declares (among others) `unplugin`,
// and `./src` exists
const cwd = process.cwd();

describe('validatePackages', () => {
  test('accepts declared package names', () => {
    expect(() => validatePackages(['unplugin'], cwd)).not.toThrow();
  });

  test('accepts the package’s own name', () => {
    expect(() => validatePackages(['kolay'], cwd)).not.toThrow();
  });

  test('accepts relative paths that exist', () => {
    expect(() => validatePackages(['./src', '.'], cwd)).not.toThrow();
  });

  test('rejects non-arrays, explaining the expected shape', () => {
    expect(() => validatePackages({ packages: ['unplugin'] }, cwd)).toThrowError(
      /expects an array of package names and\/or relative paths/
    );
    expect(() => validatePackages('unplugin', cwd)).toThrowError(/expects an array/);
  });

  test('rejects undeclared package names', () => {
    expect(() => validatePackages(['not-a-real-dependency-xyz'], cwd)).toThrowError(
      /"not-a-real-dependency-xyz": not listed in .*package\.json/
    );
  });

  test('rejects relative paths that do not exist', () => {
    expect(() => validatePackages(['./does-not-exist-xyz'], cwd)).toThrowError(
      /"\.\/does-not-exist-xyz": does not exist/
    );
  });

  test('rejects absolute paths', () => {
    expect(() => validatePackages(['/etc/passwd'], cwd)).toThrowError(
      /absolute paths are not supported/
    );
  });

  test('rejects non-string entries', () => {
    expect(() => validatePackages([42], cwd)).toThrowError(/every entry must be a string/);
  });

  test('reports every problem at once', () => {
    let message = '';

    try {
      validatePackages(['unplugin', 'nope-xyz', './missing-xyz', 42], cwd);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain('"nope-xyz": not listed');
    expect(message).toContain('"./missing-xyz": does not exist');
    expect(message).toContain('42 (number): every entry must be a string');
    // the valid entry is not reported
    expect(message).not.toContain('"unplugin"');
  });
});
