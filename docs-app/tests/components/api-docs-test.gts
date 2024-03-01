import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { APIDocs } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('<APIDocs>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks, async () => ({
    apiDocs: await import('kolay/api-docs:virtual'),
    manifest: await import('kolay/manifest:virtual'),
  }));

  test('it works', async function (assert) {
    await render(
      <template>
        <APIDocs @package="kolay" @module="src/browser/re-exports" @name="Manifest" />
      </template>
    );

    assert.dom().containsText('Manifest');
  });
});
