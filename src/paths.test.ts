import { describe, expect, test } from 'vitest';

import { concatenatePath, trimSlashes } from './paths.js';

describe('concatenatePath', () => {
  test('one slash, however either side is punctuated', () => {
    expect(concatenatePath('/app', 'docs/page.md')).toBe('/app/docs/page.md');
    expect(concatenatePath('/app/', 'docs/page.md')).toBe('/app/docs/page.md');
    expect(concatenatePath('/app', '/docs/page.md')).toBe('/app/docs/page.md');
    expect(concatenatePath('/app/', '/docs/page.md')).toBe('/app/docs/page.md');
  });

  test('a root left side does not double the leading slash', () => {
    // `rootURL` defaults to '/', and a group whose prefix is the root (Home)
    // reaches this with the same shape
    expect(concatenatePath('/', 'docs/page.md')).toBe('/docs/page.md');
    expect(concatenatePath('/', '/docs/page.md')).toBe('/docs/page.md');
  });

  test('the left side keeps its own leading slash', () => {
    expect(concatenatePath('/Runtime', 'rendering')).toBe('/Runtime/rendering');
  });
});

describe('trimSlashes', () => {
  test('trims only the end it is asked for', () => {
    expect(trimSlashes('/a/b/', { leading: true })).toBe('a/b/');
    expect(trimSlashes('/a/b/', { trailing: true })).toBe('/a/b');
    expect(trimSlashes('/a/b/', { leading: true, trailing: true })).toBe('a/b');
  });

  test('repeated slashes go together', () => {
    expect(trimSlashes('///a///', { leading: true, trailing: true })).toBe('a');
  });
});
