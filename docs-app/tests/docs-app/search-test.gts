import { click, fillIn, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Search', function (hooks) {
  setupApplicationTest(hooks);

  test('submits the query as a URL query parameter', async function (assert) {
    await visit('/search');
    await fillIn('input[aria-label="Search documentation"]', 'compiled docs');
    await click('button[type="submit"]');

    assert.strictEqual(this.owner.lookup('service:router').currentURL, '/search?q=compiled%20docs');
  });
});
