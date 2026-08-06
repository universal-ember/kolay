import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { defineConfig, loadKolayConfig, validateRedirects } from './kolay-config.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, 'fixtures', 'kolay-config');

describe('loadKolayConfig', () => {
  // lilconfig owns the file forms / extensions — one fixture proves the
  // wiring, one proves our added config/ search directory
  it('loads a discovered config file, reporting its path', async () => {
    expect(await loadKolayConfig(join(fixtures, 'js-config'))).toEqual({
      config: {
        redirects: [
          { from: 'Old/*', to: 'New/*' },
          { from: 'legacy/page', to: 'modern/page' },
        ],
      },
      filepath: join(fixtures, 'js-config', 'kolay.config.js'),
    });
  });

  it('also searches a config/ directory', async () => {
    expect(await loadKolayConfig(join(fixtures, 'config-dir'))).toEqual({
      config: { redirects: [{ from: 'in-config-dir/*', to: 'found/*' }] },
      filepath: join(fixtures, 'config-dir', 'config', 'kolayrc.json'),
    });
  });

  it('defaults every known key when no config file exists', async () => {
    expect(await loadKolayConfig(join(fixtures, 'none'))).toEqual({
      config: { redirects: [] },
      filepath: undefined,
    });
  });
});

describe('defineConfig', () => {
  it('validates redirects while the config file is evaluated', () => {
    expect(() => defineConfig({ redirects: [{ from: 'a/*', to: 'b' }] })).toThrow(/must agree/);

    expect(defineConfig({ redirects: [{ from: '/a/*', to: '/b/*' }] })).toEqual({
      redirects: [{ from: 'a/*', to: 'b/*' }],
    });
  });

  it('does not add keys the config did not specify', () => {
    expect(defineConfig({})).toEqual({});
  });
});

describe('validateRedirects', () => {
  const validate = (value: unknown) => () => validateRedirects(value, 'test');

  it('normalizes leading slashes away', () => {
    expect(validateRedirects([{ from: '/docs/*', to: '/guides/*' }], 'test')).toEqual([
      { from: 'docs/*', to: 'guides/*' },
    ]);
  });

  it('allows undefined and an empty list', () => {
    expect(validateRedirects(undefined, 'test')).toEqual([]);
    expect(validateRedirects([], 'test')).toEqual([]);
  });

  it('allows overlapping-but-different subtree sources (first match wins)', () => {
    expect(
      validateRedirects(
        [
          { from: 'Runtime/sub/*', to: 'Elsewhere/*' },
          { from: 'Runtime/*', to: 'Playground/*' },
        ],
        'test'
      )
    ).toHaveLength(2);
  });

  it('rejects a non-array', () => {
    expect(validate({ from: 'a', to: 'b' })).toThrow(/expected an array/);
  });

  it('rejects entries that are not { from: string, to: string }', () => {
    expect(validate([{ from: 'a' }])).toThrow(/every entry must be/);
    expect(validate([{ from: 'a', to: 3 }])).toThrow(/every entry must be/);
    expect(validate(['a'])).toThrow(/every entry must be/);
  });

  it('rejects a trailing-/* mismatch', () => {
    expect(validate([{ from: 'a/*', to: 'b' }])).toThrow(/must agree/);
    expect(validate([{ from: 'a', to: 'b/*' }])).toThrow(/must agree/);
  });

  it('rejects empty paths', () => {
    expect(validate([{ from: '', to: 'b' }])).toThrow(/non-empty/);
    expect(validate([{ from: '/*', to: 'b/*' }])).toThrow(/non-empty/);
  });

  it('rejects duplicate `from`s, case-insensitively', () => {
    expect(
      validate([
        { from: 'Old/*', to: 'New/*' },
        { from: 'old/*', to: 'Other/*' },
      ])
    ).toThrow(/share the `from`/);
  });

  it('treats exact paths with and without .md as the same', () => {
    expect(
      validate([
        { from: 'old/page', to: 'new/page' },
        { from: 'old/page.md', to: 'other/page' },
      ])
    ).toThrow(/share the `from`/);

    expect(
      validate([
        { from: 'a/page', to: 'b/page.md' },
        { from: 'b/page', to: 'c/page' },
      ])
    ).toThrow(/don't chain/);
  });

  it('rejects a target that another entry would redirect again', () => {
    expect(
      validate([
        { from: 'a/*', to: 'b/*' },
        { from: 'b/*', to: 'c/*' },
      ])
    ).toThrow(/don't chain/);
  });

  it('rejects a self-referencing subtree (an infinite rewrite)', () => {
    expect(validate([{ from: 'a/*', to: 'a/nested/*' }])).toThrow(/don't chain/);
  });

  it('rejects an exact self-redirect', () => {
    expect(validate([{ from: 'a/page', to: 'a/page' }])).toThrow(/don't chain/);
  });
});
