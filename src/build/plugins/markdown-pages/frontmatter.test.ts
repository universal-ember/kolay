import { describe, expect, test } from 'vitest';

import { defaultPopulateManifestEntry, extractFrontmatter } from './frontmatter.js';

describe('extractFrontmatter', () => {
  test('reads the frontmatter block and strips it from the content', () => {
    const source = `---\ntitle: Hello\norder: 2\n---\n# Heading\n\nbody\n`;

    const { data, content } = extractFrontmatter(source, 'a/page.md');

    expect(data).toEqual({ title: 'Hello', order: 2 });
    expect(content).toBe('# Heading\n\nbody\n');
  });

  test('nested data parses', () => {
    const source = `---\nauthor:\n  name: Ryan\n  team: docs\ntags:\n  - one\n  - two\n---\nbody`;

    const { data } = extractFrontmatter(source, 'a/page.md');

    expect(data).toEqual({ author: { name: 'Ryan', team: 'docs' }, tags: ['one', 'two'] });
  });

  test('no block: data is undefined and the content is untouched', () => {
    const source = `# Heading\n\nbody\n`;

    const { data, content } = extractFrontmatter(source, 'a/page.md');

    expect(data).toBeUndefined();
    expect(content).toBe(source);
  });

  test('a leading thematic break with no closing delimiter is not frontmatter', () => {
    const source = `---\n\nnot frontmatter\n`;

    const { data, content } = extractFrontmatter(source, 'a/page.md');

    expect(data).toBeUndefined();
    expect(content).toBe(source);
  });

  test('a closed block whose YAML is a scalar strips, but yields no data', () => {
    const source = `---\njust some text\n---\nbody\n`;

    const { data, content } = extractFrontmatter(source, 'a/page.md');

    expect(data).toBeUndefined();
    expect(content).toBe('body\n');
  });

  test('empty block: data is {} and the block is stripped', () => {
    const source = `---\n---\n# Heading\n`;

    const { data, content } = extractFrontmatter(source, 'a/page.md');

    expect(data).toEqual({});
    expect(content).toBe('# Heading\n');
  });

  test('CRLF sources parse and strip', () => {
    const source = `---\r\ntitle: Hello\r\n---\r\n# Heading\r\n`;

    const { data, content } = extractFrontmatter(source, 'a/page.md');

    expect(data).toEqual({ title: 'Hello' });
    expect(content).toBe('# Heading\r\n');
  });

  test('invalid YAML throws, naming the file', () => {
    const source = `---\ntitle: [unclosed\n---\nbody`;

    expect(() => extractFrontmatter(source, 'docs/broken.md')).toThrow(/docs\/broken\.md/);
  });
});

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

  test('mutates neither input', () => {
    const entry = { meta: { a: 1 } };
    const frontmatter = { a: 2, b: { c: 3 } };

    defaultPopulateManifestEntry(entry, frontmatter, { path: 'x' });

    expect(entry).toEqual({ meta: { a: 1 } });
    expect(frontmatter).toEqual({ a: 2, b: { c: 3 } });
  });
});
