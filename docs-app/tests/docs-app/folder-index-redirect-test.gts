import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

/**
 * A folder's own URL names a real place in the docs but no document of its
 * own, and lands on the folder's first page — the same rule a group's own
 * URL follows.
 *
 * `authoring` is a folder in `src/templates`, the co-located group, whose
 * pages occupy the root URL space; that is why its URL is a single segment
 * rather than `/Group/authoring`.
 */
module('folder index redirects', function (hooks) {
  setupApplicationTest(hooks);

  test("a folder's URL lands on its index page, when it has one", async function (assert) {
    await visit('/authoring');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/authoring/index');
    assert.dom('[data-page-error]').doesNotExist();
  });

  test('a folder with no index page lands on its first page', async function (assert) {
    await visit('/development');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/development/rendering-pages');
    assert.dom('[data-page-error]').doesNotExist();
  });

  test('a trailing slash lands in the same place', async function (assert) {
    await visit('/authoring/');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/authoring/index');
  });

  test('the folder is matched case-insensitively, like every other path', async function (assert) {
    await visit('/AUTHORING');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/authoring/index');
  });

  // The guard that keeps the redirect from swallowing ordinary navigation:
  // a page visit lands on the wildcard's index too, with the page as the
  // wildcard param.
  test("a page's own URL is left where it is", async function (assert) {
    await visit('/authoring/code-fences');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/authoring/code-fences');
    assert.dom('[data-page-error]').doesNotExist();
  });

  test('a path that is neither a page nor a folder still errors', async function (assert) {
    await visit('/authoring/not-a-real-page');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/authoring/not-a-real-page', 'no redirect');
    assert.dom('[data-page-error]').exists('and the reader is told the page is missing');
  });
});
