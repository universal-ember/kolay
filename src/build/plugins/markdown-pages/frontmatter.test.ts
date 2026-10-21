import { describe, expect, test } from 'vitest';

import { extractFrontmatter } from './frontmatter.js';

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
