import { settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

/**
 * The entries under test live in this app's kolay.config.js: real old
 * URLs from previous arrangements of this docs site.
 */
module('redirects (from kolay.config.js)', function (hooks) {
  setupApplicationTest(hooks);

  test('a /* entry redirects the whole subtree', async function (assert) {
    await visit('/docs/component-signature');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/TypeDoc/components/component-signature');
    assert.dom('[data-page-error]').doesNotExist();
  });

  test('an in-app transition to an old URL is redirected before it lands', async function (assert) {
    await visit('/install/index.md');

    const router = this.owner.lookup('service:router');

    // the redirect (in routeWillChange) aborts this transition in
    // favor of the rewritten one — swallow the TransitionAborted rejection
    await router.transitionTo('/plugins/helpers').catch(() => null);
    await settled();

    assert.strictEqual(router.currentURL, '/development/helpers.md');
  });

  test('matching is case-insensitive', async function (assert) {
    await visit('/DOCS/helper-signature');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/TypeDoc/components/helper-signature');
  });

  test('an exact entry redirects that path, with or without .md', async function (assert) {
    await visit('/usage/setup');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/install/index.md');

    await visit('/usage/setup.md');

    assert.strictEqual(router.currentURL, '/install/index.md');
    assert.dom('[data-page-error]').doesNotExist();
  });

  test('an exact entry does not redirect deeper paths', async function (assert) {
    await visit('/usage/setup/deeper');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/usage/setup/deeper');
  });

  test('unrelated paths are untouched', async function (assert) {
    await visit('/development/helpers.md');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(router.currentURL, '/development/helpers.md');
    assert.dom('[data-page-error]').doesNotExist();
  });
});
