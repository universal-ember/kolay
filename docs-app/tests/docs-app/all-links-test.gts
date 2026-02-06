import { module, skip, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { visitAllLinks } from '@universal-ember/test-support';

const skippable = new URLSearchParams(location.search).has('skipAllLinks') ? skip : test;

module('All Links', function (hooks) {
  setupApplicationTest(hooks);

  skippable('are visitable without error', async function () {
    await visitAllLinks(async () => new Promise((resolve) => setTimeout(resolve, 250)), {
      '/Home': '/usage/index',
    });
  });
});
