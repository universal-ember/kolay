import { describe, expect, test } from 'vitest';

import { isActive } from './is-active.js';

import type { Collection, Page } from '../types.ts';

/** As generated at build time: `path` carries the base, appRelativePath does not. */
function page(appRelativePath: string, base = '/'): Page {
  return {
    path: base === '/' ? appRelativePath : base.replace(/\/$/, '') + appRelativePath,
    appRelativePath,
    name: appRelativePath,
    groupName: 'Documentation',
    cleanedName: appRelativePath,
  };
}

function collection(appRelativePath: string, pages: (Page | Collection)[]): Collection {
  return { path: appRelativePath, appRelativePath, name: appRelativePath, pages };
}

describe('isActive', () => {
  test('matches the current page', () => {
    expect(isActive(page('/Documentation/x.md'), '/Documentation/x.md')).toBe(true);
    expect(isActive(page('/Documentation/x.md'), '/Documentation/y.md')).toBe(false);
  });

  test('is insensitive to the .md extension on either side', () => {
    expect(isActive(page('/Documentation/x.md'), '/Documentation/x')).toBe(true);
    expect(isActive(page('/Documentation/x'), '/Documentation/x.md')).toBe(true);
  });

  test('does not treat a sibling with a shared prefix as active', () => {
    expect(isActive(page('/Documentation/x.md'), '/Documentation/x-and-more.md')).toBe(false);
  });

  test('under a custom rootURL, matches the app-relative currentURL', () => {
    // the item's `path` is rootURL-prefixed; currentURL never is
    expect(
      isActive(page('/Documentation/x.md', '/my-github-project/'), '/Documentation/x.md')
    ).toBe(true);
    expect(
      isActive(page('/Documentation/x.md', '/my-github-project/'), '/Documentation/y.md')
    ).toBe(false);
  });

  test('ignores query params and hash on the current URL', () => {
    expect(isActive(page('/Documentation/x.md'), '/Documentation/x.md?foo=1')).toBe(true);
    expect(isActive(page('/Documentation/x.md'), '/Documentation/x.md#section')).toBe(true);
  });

  test('an index page is active when visited at its own URL, like any page', () => {
    // index pages are only servable at their own URL (a collection's bare
    // URL is not a route), so this is the whole story for them
    expect(
      isActive(page('/Documentation/sub-folder/index.md'), '/Documentation/sub-folder/index')
    ).toBe(true);
    expect(isActive(page('/Documentation/sub-folder/index.md'), '/Documentation/sub-folder')).toBe(
      false
    );
  });

  test('the root path is never active', () => {
    expect(isActive(page('/'), '/')).toBe(false);
  });

  test('nothing is active without a current URL', () => {
    expect(isActive(page('/Documentation/x.md'), null)).toBe(false);
    expect(isActive(page('/Documentation/x.md'), undefined)).toBe(false);
  });

  test('a collection is active when any page within it is, recursively', () => {
    const tree = collection('/Documentation', [
      page('/Documentation/a.md'),
      collection('/Documentation/sub-folder', [page('/Documentation/sub-folder/b.md')]),
    ]);

    expect(isActive(tree, '/Documentation/sub-folder/b.md')).toBe(true);
    expect(isActive(tree, '/Documentation/a.md')).toBe(true);
    expect(isActive(tree, '/Documentation/elsewhere.md')).toBe(false);
  });
});
