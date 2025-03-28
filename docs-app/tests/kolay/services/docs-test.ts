import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { setupKolay } from 'kolay/test-support';

module('@service(Docs)', function (hooks) {
  setupTest(hooks);
  setupKolay(hooks);

  test('No duplicates in available Groups', async function (assert) {
    const docs = this.owner.lookup('service:kolay/docs');

    const groups = docs.availableGroups;

    assert.strictEqual(groups.length, new Set(groups).size);
  });
});
