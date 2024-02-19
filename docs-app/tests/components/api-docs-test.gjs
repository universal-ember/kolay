import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { APIDocs } from 'kolay';

module('<APIDocs>', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    await render(
      <template>
        <APIDocs
          @module="declarations/browser/re-exports"
          @name="APIDocs"
          @apiDocs="/docs/kolay.json"
        />
      </template>
    );

    assert.dom().containsText('APIDocs');
  });
});
