import { settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

/**
 * The entries under test live in this app's kolay.config.js.
 */
module('redirects (from kolay.config.js)', function (hooks) {
  setupApplicationTest(hooks);

  test('a /* entry redirects the whole subtree', async function (assert) {
    await visit('/guides/rendering-pages.md');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/development/rendering-pages.md');
    assert.dom('[data-page-error]').doesNotExist();
    assert.dom('.home-doc').containsText('Rendering Pages');
  });

  test('an in-app transition to an old URL is redirected before it lands', async function (assert) {
    await visit('/development/helpers.md');

    const router = this.owner.lookup('service:router');

    // the redirect (in routeWillChange) aborts this transition in
    // favor of the rewritten one — swallow the TransitionAborted rejection
    await router.transitionTo('/guides/ordering-pages.md').catch(() => null);
    await settled();

    assert.strictEqual(router.currentURL, '/development/ordering-pages.md');
  });

  test('matching is case-insensitive', async function (assert) {
    await visit('/GUIDES/ordering-pages.md');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/development/ordering-pages.md');
  });

  test('an exact entry redirects that one path', async function (assert) {
    await visit('/legacy-install');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/install/index.md');
    assert.dom('[data-page-error]').doesNotExist();
  });

  test('an exact entry does not redirect deeper paths', async function (assert) {
    await visit('/legacy-install/deeper');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/legacy-install/deeper');
  });

  test('unrelated paths are untouched', async function (assert) {
    await visit('/development/helpers.md');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/development/helpers.md');
    assert.dom('[data-page-error]').doesNotExist();
  });
});
