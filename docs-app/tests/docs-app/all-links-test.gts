import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { visitAllLinks } from '@universal-ember/test-support';

module('All Links', function (hooks) {
  setupApplicationTest(hooks);

  test('are visitable without error', async function () {
    await visitAllLinks(async () => new Promise(resolve => setTimeout(resolve, 250)));
  });
});
