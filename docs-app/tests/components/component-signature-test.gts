import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { ComponentSignature } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('<ComponentSignature>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks, async () => ({
    apiDocs: await import('kolay/api-docs:virtual'),
    manifest: await import('kolay/manifest:virtual'),
  }));

  test('it works', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @package="kolay"
          @module="src/browser/re-exports"
          @name="ComponentSignature"
        />
      </template>
    );

    assert.dom().containsText('Arguments');
    assert.dom().containsText('@package');
  });
});
