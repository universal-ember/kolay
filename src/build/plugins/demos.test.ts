import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { demoSpecifiers, parseDemosArgs } from './demos.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('parseDemosArgs', () => {
  it('accepts a path and a specifier', () => {
    expect(parseDemosArgs(here, { as: '#demos/foo' })).toEqual({
      src: here,
      alias: '#demos/foo',
    });
  });

  it('accepts a file URL (import.meta.resolve style)', () => {
    expect(parseDemosArgs(`file://${here}`, { as: '#demos/foo' })).toEqual({
      src: here,
      alias: '#demos/foo',
    });
  });

  it('uses any valid import URI verbatim', () => {
    expect(parseDemosArgs(here, { as: 'demo-kit' }).alias).toBe('demo-kit');
    expect(parseDemosArgs(here, { as: '@scope/demos' }).alias).toBe('@scope/demos');
  });

  it.each([
    [undefined, undefined, /requires a path/],
    [here, undefined, /requires an `as` option/],
    [here, { as: '' }, /requires an `as` option/],
    [here, { as: './demos' }, /valid import URI/],
    [here, { as: '/demos' }, /valid import URI/],
    [here, { as: 'demos/' }, /valid import URI/],
    [here, { as: 'demos foo' }, /valid import URI/],
    [join(here, 'does-not-exist'), { as: '#demos/foo' }, /path does not exist/],
  ])('rejects %s / %o', (src, options, message) => {
    // @ts-expect-error deliberately wrong shapes
    expect(() => parseDemosArgs(src, options)).toThrow(message);
  });
});

describe('demoSpecifiers', () => {
  it('maps each file, and lets index files provide their directory', () => {
    const map = demoSpecifiers('#demos/foo', '/abs', [
      'button.gjs',
      'index.gjs',
      'forms/input.gts',
      'forms/index.gjs',
    ]);

    expect(map).toEqual({
      '#demos/foo/button': '/abs/button.gjs',
      '#demos/foo/index': '/abs/index.gjs',
      '#demos/foo': '/abs/index.gjs',
      '#demos/foo/forms/input': '/abs/forms/input.gts',
      '#demos/foo/forms/index': '/abs/forms/index.gjs',
      '#demos/foo/forms': '/abs/forms/index.gjs',
    });
  });
});
