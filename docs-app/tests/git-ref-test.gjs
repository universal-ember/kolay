import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { getPageTitle } from 'ember-page-title/test-support';

module('gitRef()', function () {
  module('Visiting /', function (hooks) {
    setupApplicationTest(hooks);

    test('git red is in the document title', async function (assert) {
      await visit('/');

      let title = getPageTitle();

      assert.ok(title.includes('Docs'));
      assert.ok(title.includes(' :: '));
      assert.strictEqual(title.length, 'Docs :: '.length - 1 + 8);
    });
  });
});
