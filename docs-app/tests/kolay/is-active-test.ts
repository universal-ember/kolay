import { module, test } from 'qunit';

import { isActive } from 'kolay';

import type { Page, PageTree } from 'kolay';

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

function pageTree(appRelativePath: string, pages: (Page | PageTree)[]): PageTree {
  return { path: appRelativePath, appRelativePath, name: appRelativePath, pages };
}

module('isActive', function () {
  test('matches the current page', function (assert) {
    assert.true(isActive(page('/Documentation/x.md'), '/Documentation/x.md'));
    assert.false(isActive(page('/Documentation/x.md'), '/Documentation/y.md'));
  });

  test('is insensitive to the .md extension on either side', function (assert) {
    assert.true(isActive(page('/Documentation/x.md'), '/Documentation/x'));
    assert.true(isActive(page('/Documentation/x'), '/Documentation/x.md'));
  });

  test('is insensitive to casing, in the path and in the .md extension', function (assert) {
    assert.true(isActive(page('/Documentation/x.md'), '/documentation/x.md'));
    assert.true(isActive(page('/Documentation/x.md'), '/DOCUMENTATION/X'));
    assert.true(isActive(page('/Documentation/x.md'), '/Documentation/x.MD'));
    assert.false(isActive(page('/Documentation/x.md'), '/documentation/y.md'));
  });

  test('does not treat a sibling with a shared prefix as active', function (assert) {
    assert.false(isActive(page('/Documentation/x.md'), '/Documentation/x-and-more.md'));
  });

  test('under a custom rootURL, matches the app-relative currentURL', function (assert) {
    // the item's `path` is rootURL-prefixed; currentURL never is
    assert.true(
      isActive(page('/Documentation/x.md', '/my-github-project/'), '/Documentation/x.md')
    );
    assert.false(
      isActive(page('/Documentation/x.md', '/my-github-project/'), '/Documentation/y.md')
    );
  });

  test('ignores query params and hash on the current URL', function (assert) {
    assert.true(isActive(page('/Documentation/x.md'), '/Documentation/x.md?foo=1'));
    assert.true(isActive(page('/Documentation/x.md'), '/Documentation/x.md#section'));
  });

  test('an index page is active when visited at its own URL, like any page', function (assert) {
    // index pages are only servable at their own URL (a page tree's bare
    // URL is not a route), so this is the whole story for them
    assert.true(
      isActive(page('/Documentation/sub-folder/index.md'), '/Documentation/sub-folder/index')
    );
    assert.false(isActive(page('/Documentation/sub-folder/index.md'), '/Documentation/sub-folder'));
  });

  test('the root path is never active', function (assert) {
    assert.false(isActive(page('/'), '/'));
  });

  test('nothing is active without a current URL', function (assert) {
    assert.false(isActive(page('/Documentation/x.md'), null));
    assert.false(isActive(page('/Documentation/x.md'), undefined));
  });

  test('a page tree is active when any page within it is, recursively', function (assert) {
    const tree = pageTree('/Documentation', [
      page('/Documentation/a.md'),
      pageTree('/Documentation/sub-folder', [page('/Documentation/sub-folder/b.md')]),
    ]);

    assert.true(isActive(tree, '/Documentation/sub-folder/b.md'));
    assert.true(isActive(tree, '/Documentation/a.md'));
    assert.false(isActive(tree, '/Documentation/elsewhere.md'));
  });
});
