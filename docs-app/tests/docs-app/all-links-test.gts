import { assert as debugAssert } from '@ember/debug';
import { click, currentURL, findAll } from '@ember/test-helpers';
import { visit } from '@ember/test-helpers';
import { find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

function findInAppLinks(): string[] {
return (findAll('a')?.map(link => link.getAttribute('href'))?.filter(href => !href?.startsWith('http')).filter(Boolean) || []) as string[];
}

module('All Links', function (hooks) {
  setupApplicationTest(hooks);

  test('are visitable without error', async function (assert) {
    /**
     * string of "on::target"
     */
    let visited = new Set();
    let returnTo = '/';

    await visit(returnTo);

    let inAppLinks = findInAppLinks();
    let queue: (string | { changeReturnTo: string } )[] = [...inAppLinks];

    while (queue.length > 0) {
      let toVisit = queue.shift();

      debugAssert(`Queue entries cannot be falsey`, toVisit);

      if (typeof toVisit === 'object' && toVisit !== null) {
        returnTo = toVisit.changeReturnTo;
        continue;
      }

      let key = `${currentURL()}::${toVisit}`;

      if (visited.has(key)) continue;

      await visit(returnTo);

      let link = find(`a[href="${toVisit}"]`);

      debugAssert(`link exists with ${toVisit}`, link)

      await click(link);
      assert.ok(currentURL().startsWith(toVisit), `Navigation was successful: to:${ toVisit }, from:${returnTo}`);
      visited.add(key);

      let links = findInAppLinks();

      queue.push({ changeReturnTo: currentURL() });
      queue.push(...links);
    }
  });
});
