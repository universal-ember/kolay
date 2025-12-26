import { renderSettled } from '@ember/renderer';
import { click, settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Errors', function (hooks) {
  setupApplicationTest(hooks);

  module('Not found', function () {
    test('not in any manifest / group', async function (assert) {
      await visit('/usage/does-not-exist.md');

      assert.dom().doesNotContainText(`Cannot GET`, 'does not directly expose errors from fetch');
      assert.dom().doesNotContainText(`null`, 'does not incorrectly render the error');

      assert.dom(`[data-page-error]`).containsText(`Page not found for path`);
      assert.dom(`[data-page-error]`).containsText(`/usage/does-not-exist`);
      assert.dom(`[data-page-error]`).containsText(`Using group: root`);
    });

    test(`can recover after an error`, async function (assert) {
      await visit('/usage/does-not-exist.md');

      assert.dom(`[data-page-error]`).containsText(`Page not found for path`);

      await click(`a[href="/usage/setup.md"]`);
      // await this.pauseTest();

      assert.dom().doesNotContainText(`Page not found for path`);
    });

    test(`attempting to visit a route that doesn't exist in the current group, but does exist in another group`, async function (assert) {
      await visit(`/Runtime/docs/api-docs.md`);

      assert.dom().doesNotContainText(`Page not found for path`);
    });

    test('the error does not flash between known pages rendering', async function (assert) {
      visit(`/Runtime/docs/api-docs.md`);

      await renderSettled();
      assert.dom('[data-page-error]').doesNotExist();

      await settled();
      assert.dom('[data-page-error]').doesNotExist();

      visit(`/Runtime/util/logs.md`);

      await renderSettled();
      assert.dom('[data-page-error]').doesNotExist();

      await settled();
      assert.dom('[data-page-error]').doesNotExist();

      visit(`/Runtime/docs/api-docs.md#some-hash`);

      await renderSettled();
      assert.dom('[data-page-error]').doesNotExist();

      await settled();
      assert.dom('[data-page-error]').doesNotExist();

      visit(`/Runtime/docs/api-docs.md?query-param=value`);

      await renderSettled();
      assert.dom('[data-page-error]').doesNotExist();

      await settled();
      assert.dom('[data-page-error]').doesNotExist();
    });
  });
});
