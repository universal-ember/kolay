import { describe, expect, test } from 'vitest';

import { defaultPopulateManifestEntry } from './populate-manifest-entry.js';

describe('defaultPopulateManifestEntry', () => {
  test('nests the frontmatter under meta, preserving the entry', () => {
    const result = defaultPopulateManifestEntry(
      { path: '/dev/intro.md', name: 'intro', title: 'From json' },
      { author: 'Ryan' },
      { path: 'dev/intro.md' }
    );

    expect(result).toEqual({
      path: '/dev/intro.md',
      name: 'intro',
      title: 'From json',
      meta: { author: 'Ryan' },
    });
  });

  test('empty frontmatter still yields a meta key', () => {
    const result = defaultPopulateManifestEntry({ name: 'intro' }, {}, { path: 'x' });

    expect(result).toEqual({ name: 'intro', meta: {} });
  });

  test("deeply merges with an existing entry's meta; frontmatter wins", () => {
    const entry = { meta: { author: 'json author', tags: { a: 1, b: 2 } } };
    const frontmatter = { author: 'frontmatter author', tags: { b: 3 } };

    const result = defaultPopulateManifestEntry(entry, frontmatter, { path: 'x' });

    expect(result.meta).toEqual({
      author: 'frontmatter author',
      tags: { a: 1, b: 3 },
    });
  });

  test("frontmatter arrays replace the json config's, rather than merging by index", () => {
    const entry = { meta: { tags: ['json', 'from', 'config'] } };
    const frontmatter = { tags: ['frontmatter'] };

    const result = defaultPopulateManifestEntry(entry, frontmatter, { path: 'x' });

    expect(result.meta).toEqual({ tags: ['frontmatter'] });
  });

  test('mutates neither input', () => {
    const entry = { meta: { a: 1 } };
    const frontmatter = { a: 2, b: { c: 3 } };

    defaultPopulateManifestEntry(entry, frontmatter, { path: 'x' });

    expect(entry).toEqual({ meta: { a: 1 } });
    expect(frontmatter).toEqual({ a: 2, b: { c: 3 } });
  });
});
