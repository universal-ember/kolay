import { module, skip, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { visitAllLinks } from '@universal-ember/test-support';

const skippable = new URLSearchParams(location.search).has('skipAllLinks') ? skip : test;

// The Redirects page links its own examples; kolay.config.js sends them here.
const KNOWN_REDIRECTS = {
  '/usage/setup': '/install/index.md',
  '/docs/component-signature': '/TypeDoc/components/component-signature',
};

module('All Links', function (hooks) {
  setupApplicationTest(hooks);

  skippable('are visitable without error', async function () {
    await visitAllLinks(undefined, KNOWN_REDIRECTS);
  });
});
