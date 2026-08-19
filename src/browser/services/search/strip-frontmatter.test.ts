import { describe, expect, test } from 'vitest';

import { stripFrontmatter } from './strip-frontmatter.ts';

describe('stripFrontmatter', () => {
  test('removes a leading frontmatter block', () => {
    expect(stripFrontmatter('---\ntitle: Hello\n---\n# Heading\n')).toBe('# Heading\n');
  });

  test('removes an empty block', () => {
    expect(stripFrontmatter('---\n---\n# Heading\n')).toBe('# Heading\n');
  });

  test('handles CRLF', () => {
    expect(stripFrontmatter('---\r\ntitle: Hello\r\n---\r\n# Heading\r\n')).toBe('# Heading\r\n');
  });

  test('leaves text without frontmatter alone', () => {
    expect(stripFrontmatter('# Heading\n\n---\n\nafter a break\n')).toBe(
      '# Heading\n\n---\n\nafter a break\n'
    );
  });

  test('an unclosed leading --- is a thematic break, not frontmatter', () => {
    expect(stripFrontmatter('---\n\nnot frontmatter\n')).toBe('---\n\nnot frontmatter\n');
  });
});
