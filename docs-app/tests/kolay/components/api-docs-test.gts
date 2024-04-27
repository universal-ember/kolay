import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { APIDocs } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('<APIDocs>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test('it works', async function (assert) {
    await render(
      <template>
        <APIDocs @package="kolay" @module="src/browser/re-exports" @name="Manifest" />
      </template>
    );

    assert.dom().containsText('Manifest');
  });
});
