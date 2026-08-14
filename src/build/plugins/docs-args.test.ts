import { describe, expect, test } from 'vitest';

import { parseDocsArgs } from './docs-args.js';

/**
 * A docs() call contributes one usage per group, so the common case is a
 * one-element list.
 */
function only(...args: Parameters<typeof parseDocsArgs>) {
  const usages = parseDocsArgs(...args);

  expect(usages).toHaveLength(1);

  return usages[0];
}

describe('parseDocsArgs', () => {
  test('a plain group name with options.src', () => {
    expect(only('guides', { src: '/somewhere/guides-dir' })).toEqual({
      src: '/somewhere/guides-dir',
      groups: [{ name: 'guides', src: '/somewhere/guides-dir' }],
    });
  });

  test('a path: its last segment is the group name, and it is the src', () => {
    expect(only('./guides')).toEqual({
      groups: [{ name: 'guides', src: './guides' }],
    });
  });

  test('a file URL works the same way', () => {
    expect(only('file:///home/me/project/demos')).toEqual({
      groups: [{ name: 'demos', src: 'file:///home/me/project/demos' }],
    });
  });

  test('trailing separators are ignored when deriving the name', () => {
    expect(only('file:///home/me/project/demos/')?.groups).toEqual([
      { name: 'demos', src: 'file:///home/me/project/demos/' },
    ]);
  });

  test('markdown options ride along', () => {
    const remarkPlugins = [() => {}];

    expect(only('./guides', { remarkPlugins, scope: 'import x from "y";' })).toEqual({
      remarkPlugins,
      scope: 'import x from "y";',
      groups: [{ name: 'guides', src: './guides' }],
    });
  });

  test('no arguments: no group (co-located pages only)', () => {
    expect(only()).toEqual({ groups: [] });
  });

  test('options-only: no group, with markdown options', () => {
    const rehypePlugins = [() => {}];

    expect(only({ rehypePlugins })).toEqual({ rehypePlugins, groups: [] });
  });

  test('options-only with an src derives the group from it', () => {
    expect(only({ src: './my-docs' })?.groups).toEqual([{ name: 'my-docs', src: './my-docs' }]);
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

describe('parseDocsArgs | collection', () => {
  const collection = [
    { name: 'store', src: './packages/store/docs' },
    { name: 'ember', src: './packages/ember/docs' },
  ];

  test('a group with an src collects others: a usage per group, and the tree', () => {
    const usages = parseDocsArgs('packages', { src: './packages/docs', collection });

    expect(usages.map((usage) => usage.groups)).toEqual([
      [{ name: 'packages', src: './packages/docs' }],
      [{ name: 'store', src: './packages/store/docs' }],
      [{ name: 'ember', src: './packages/ember/docs' }],
    ]);

    expect(usages[0]?.nav).toEqual({
      name: 'packages',
      group: 'packages',
      children: [
        { name: 'store', group: 'store', children: [] },
        { name: 'ember', group: 'ember', children: [] },
      ],
    });
    expect(usages.slice(1).every((usage) => usage.nav === undefined)).toBe(true);
  });

  test('a collection group needs no src of its own', () => {
    const usages = parseDocsArgs('packages', { collection });

    expect(usages[0]).toEqual({
      groups: [],
      nav: {
        name: 'packages',
        // no pages of its own
        group: null,
        children: [
          { name: 'store', group: 'store', children: [] },
          { name: 'ember', group: 'ember', children: [] },
        ],
      },
    });
    expect(usages.slice(1).map((usage) => usage.groups)).toEqual([
      [{ name: 'store', src: './packages/store/docs' }],
      [{ name: 'ember', src: './packages/ember/docs' }],
    ]);
  });

  test('collections nest', () => {
    const usages = parseDocsArgs('packages', {
      collection: [
        {
          name: 'store',
          src: './packages/store/docs',
          collection: [{ name: 'json-api', src: './packages/json-api/docs' }],
        },
      ],
    });

    expect(usages[0]?.nav).toEqual({
      name: 'packages',
      group: null,
      children: [
        {
          name: 'store',
          group: 'store',
          children: [{ name: 'json-api', group: 'json-api', children: [] }],
        },
      ],
    });
    expect(
      usages.flatMap((usage) => usage.groups.map((group: { name: string }) => group.name))
    ).toEqual(['store', 'json-api']);
  });

  test("a collected group's src can be its name, as anywhere else", () => {
    // a plain string entry, like the config file's own `docs` entries: the
    // last path segment names the group
    const usages = parseDocsArgs('packages', { collection: ['./packages/store'] as never });

    expect(usages[0]?.nav?.children).toEqual([{ name: 'store', group: 'store', children: [] }]);
    expect(usages[1]?.groups).toEqual([{ name: 'store', src: './packages/store' }]);
  });

  test('each collected group keeps its own markdown options', () => {
    const shared = [() => {}];
    const own = [() => {}];
    const usages = parseDocsArgs('packages', {
      remarkPlugins: shared,
      collection: [
        { name: 'store', src: './packages/store/docs' },
        {
          name: 'ember',
          src: './packages/ember/docs',
          remarkPlugins: own,
          scope: 'import {} from "x";',
        },
      ],
    });

    expect(usages.map((usage) => usage.remarkPlugins)).toEqual([shared, shared, own]);
    expect(usages.map((usage) => usage.scope)).toEqual([
      undefined,
      undefined,
      'import {} from "x";',
    ]);
  });

  test('a collection with no group to collect into is an error', () => {
    expect(() => parseDocsArgs({ collection } as never)).toThrowError(
      /has no group to collect them into/
    );
  });

  test('an empty or non-array collection is an error', () => {
    expect(() => parseDocsArgs('packages', { collection: [] })).toThrowError(
      /non-empty array of the groups to collect/
    );
    expect(() => parseDocsArgs('packages', { collection: 'data' as never })).toThrowError(
      /non-empty array of the groups to collect/
    );
  });

  test('a collected group with no src (and no collection of its own) is an error', () => {
    expect(() => parseDocsArgs('packages', { collection: [{ name: 'store' }] })).toThrowError(
      /docs\("store"\) needs to know where the group's docs live/
    );
  });

  test('a collected group with no name is an error', () => {
    expect(() => parseDocsArgs('packages', { collection: [{ remarkPlugins: [] }] })).toThrowError(
      /has no name, and no src to derive one from/
    );
  });

  test('a non-object collection entry is an error', () => {
    expect(() => parseDocsArgs('packages', { collection: [42 as never] })).toThrowError(
      /A collection's entries describe groups/
    );
  });
});
