import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { demoSpecifiers, parseDemosArgs } from './demos.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('parseDemosArgs', () => {
  it('accepts a path and an alias', () => {
    expect(parseDemosArgs(here, { as: 'demos/foo' })).toEqual({
      src: here,
      alias: 'demos/foo',
    });
  });

  it('accepts a file URL (import.meta.resolve style)', () => {
    expect(parseDemosArgs(`file://${here}`, { as: 'demos/foo' })).toEqual({
      src: here,
      alias: 'demos/foo',
    });
  });

  it.each([
    [undefined, undefined, /requires a path/],
    [here, undefined, /requires an `as` option/],
    [here, { as: '' }, /requires an `as` option/],
    [here, { as: 'virtual:demos/foo' }, /should not include the 'virtual:' prefix/],
    [here, { as: '/demos' }, /should not start or end with '\/'/],
    [here, { as: 'demos/' }, /should not start or end with '\/'/],
    [join(here, 'does-not-exist'), { as: 'demos/foo' }, /path does not exist/],
  ])('rejects %s / %o', (src, options, message) => {
    // @ts-expect-error deliberately wrong shapes
    expect(() => parseDemosArgs(src, options)).toThrow(message);
  });
});

describe('demoSpecifiers', () => {
  it('maps each file, and lets index files provide their directory', () => {
    const map = demoSpecifiers('demos/foo', '/abs', [
      'button.gjs',
      'index.gjs',
      'forms/input.gts',
      'forms/index.gjs',
    ]);

    expect(map).toEqual({
      'virtual:demos/foo/button': '/abs/button.gjs',
      'virtual:demos/foo/index': '/abs/index.gjs',
      'virtual:demos/foo': '/abs/index.gjs',
      'virtual:demos/foo/forms/input': '/abs/forms/input.gts',
      'virtual:demos/foo/forms/index': '/abs/forms/index.gjs',
      'virtual:demos/foo/forms': '/abs/forms/index.gjs',
    });
  });
});
