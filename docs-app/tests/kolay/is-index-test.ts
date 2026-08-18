import { module, test } from 'qunit';

import { isIndex } from 'kolay';

import type { Page, PageTree } from 'kolay';

/**
 * `name` is the basename with `stripExt` applied, which strips an extension
 * twice (`parse.js`), so `index.gjs.md` becomes `index`. A fixture that puts
 * the whole path there pins a shape the build never emits.
 */
function page(path: string): Page {
  const stripExt = (x: string) => x.replace(/\.[^.]+$/, '');
  const name = stripExt(stripExt(path.split('/').pop() ?? ''));

  return {
    path,
    appRelativePath: path,
    name,
    groupName: 'Documentation',
    cleanedName: name,
  };
}

function pageTree(path: string, pages: (Page | PageTree)[]): PageTree {
  return { path, appRelativePath: path, name: path.split('/').pop() ?? '', pages };
}

module('isIndex', function () {
  test('matches a page named index, whatever its path looks like', function (assert) {
    assert.true(isIndex(page('/Documentation/sub-folder/index')), 'extension already stripped');
    assert.true(isIndex(page('/Documentation/sub-folder/index.md')), 'plain .md');
    assert.true(isIndex(page('/Documentation/sub-folder/index.gjs.md')), 'gjs');
  });

  test('does not match a non-index page', function (assert) {
    assert.false(isIndex(page('/Documentation/sub-folder/x.md')));
  });

  test('does not match a page whose name merely ends in index', function (assert) {
    assert.false(isIndex(page('/Documentation/sub-folder/api-index.md')));
  });

  test('a page tree is never an index, regardless of its path', function (assert) {
    assert.false(isIndex(pageTree('/Documentation/index', [])));
  });
});
