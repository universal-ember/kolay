import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("are visitable without error", async function (assert) {
    const visited: string[] = [];

    await visitAllLinks((path) => {
      visited.push(path);
    });

    // A snapshot of the crawl: every reachable in-app page. Sorted and
    // deduplicated, because the crawler's visit order — and how many source
    // pages it happens to collect a link from — depend on rendering timing,
    // but the set of reachable pages does not. This intentionally fails when
    // pages are added or removed — update the list to match the new reality.
    //
    // `/Home` is absent because the co-located pages' group links at the app
    // root rather than under its own name (0dab708). Nothing replaces it in the
    // list: this app's rootURL is `/`, and the crawler skips a bare `/` as the
    // page it already started on.
    for (const path of [...new Set(visited)].sort()) assert.step(path);

    assert.verifySteps([
      "/Docs",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs/sub-folder/ember-resources",
      "/my-folder-name/bar.md",
      "/my-folder-name/baz",
      "/my-folder-name/foo",
    ]);
  });
});
