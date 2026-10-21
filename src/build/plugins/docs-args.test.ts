import { describe, expect, test } from 'vitest';

import { parseDocsArgs } from './docs-args.js';

describe('parseDocsArgs', () => {
  test('a plain group name with options.src', () => {
    expect(parseDocsArgs('guides', { src: '/somewhere/guides-dir' })).toEqual({
      src: '/somewhere/guides-dir',
      groups: [{ name: 'guides', src: '/somewhere/guides-dir' }],
    });
  });

  test('a path: its last segment is the group name, and it is the src', () => {
    expect(parseDocsArgs('./guides')).toEqual({
      groups: [{ name: 'guides', src: './guides' }],
    });
  });

  test('a file URL works the same way', () => {
    expect(parseDocsArgs('file:///home/me/project/demos')).toEqual({
      groups: [{ name: 'demos', src: 'file:///home/me/project/demos' }],
    });
  });

  test('trailing separators are ignored when deriving the name', () => {
    expect(parseDocsArgs('file:///home/me/project/demos/').groups).toEqual([
      { name: 'demos', src: 'file:///home/me/project/demos/' },
    ]);
  });

  test('markdown options ride along', () => {
    const remarkPlugins = [() => {}];

    expect(parseDocsArgs('./guides', { remarkPlugins, scope: 'import x from "y";' })).toEqual({
      remarkPlugins,
      scope: 'import x from "y";',
      groups: [{ name: 'guides', src: './guides' }],
    });
  });

  test('no arguments: no group (co-located pages only)', () => {
    expect(parseDocsArgs()).toEqual({ groups: [] });
  });

  test('options-only: no group, with markdown options', () => {
    const rehypePlugins = [() => {}];

    expect(parseDocsArgs({ rehypePlugins })).toEqual({ rehypePlugins, groups: [] });
  });

  test('options-only with an src derives the group from it', () => {
    expect(parseDocsArgs({ src: './my-docs' }).groups).toEqual([
      { name: 'my-docs', src: './my-docs' },
    ]);
  });

  test('a name without an src is an error', () => {
    expect(() => parseDocsArgs('guides')).toThrowError(
      /docs\("guides"\) needs to know where the group's docs live/
    );
  });

  test('a path AND options.src is an error', () => {
    expect(() => parseDocsArgs('./guides', { src: './other' })).toThrowError(/not both/);
  });

  test('the old groups array is rejected with a migration hint', () => {
    expect(() => parseDocsArgs({ groups: [{ name: 'a', src: './a' }] } as never)).toThrowError(
      /no longer takes \{ groups: \[\.\.\.\] \} — call it once per group/
    );
  });

  test('non-string group names are rejected', () => {
    expect(() => parseDocsArgs(42 as never)).toThrowError(/expects a group name/);
  });
});
