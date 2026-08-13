import { module, test } from 'qunit';

import { isIndex } from 'kolay';

import type { Page, PageTree } from 'kolay';

function page(path: string): Page {
  return {
    path,
    appRelativePath: path,
    name: path,
    groupName: 'Documentation',
    cleanedName: path,
  };
}

function collection(path: string, pages: (Page | PageTree)[]): PageTree {
  return { path, appRelativePath: path, name: path, pages };
}

module('isIndex', function () {
  test('matches an extension-less index path', function (assert) {
    assert.true(isIndex(page('/Documentation/sub-folder/index')));
  });

  test('matches an index.md path', function (assert) {
    assert.true(isIndex(page('/Documentation/sub-folder/index.md')));
  });

  test('does not match a non-index page', function (assert) {
    assert.false(isIndex(page('/Documentation/sub-folder/x.md')));
  });

  test('a collection is never an index, regardless of its path', function (assert) {
    assert.false(isIndex(collection('/Documentation/index', [])));
  });
});
