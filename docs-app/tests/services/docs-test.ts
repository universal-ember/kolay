import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { setupKolay } from 'kolay/test-support';

module('@service(Docs)', function (hooks) {
  setupTest(hooks);
  setupKolay(hooks, async () => ({
    apiDocs: await import('kolay/api-docs:virtual'),
    manifest: await import('kolay/manifest:virtual'),
  }));

  test('No duplicates in available Groups', async function (assert) {
    let docs = this.owner.lookup('service:kolay/docs');

    let groups = docs.availableGroups;

    assert.strictEqual(groups.length, new Set(groups).size);
  });
});
