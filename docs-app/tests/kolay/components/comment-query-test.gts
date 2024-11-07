import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { CommentQuery } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('<CommentQuery>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test('it works', async function (assert) {
    await render(
      <template>
        <CommentQuery @package="kolay" @module="declarations/browser" @name="CommentQuery" />
      </template>
    );

    // TODO: I'm missing a waiter here, so this timeout shouldn't be needed
    await new Promise((resolve) => setTimeout(resolve, 100));
    await settled();

    assert.dom().containsText('Used for referencing the comment on a const or class.');
  });
});
