import { currentURL, visit } from "@ember/test-helpers";
import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

// Must stay above the crawl: once it runs, ember-repl's compiler can no longer serve a new test app.
module("Group index redirects", function (hooks) {
  setupApplicationTest(hooks);

  // The crawl can't catch this: it only compares URLs, and an erroring `/Docs` still sits at `/Docs`.
  test("visiting a group root redirects to its first page", async function (assert) {
    await visit("/Docs");

    assert.strictEqual(
      currentURL(),
      "/Docs/sub-folder/ember-primitives.md",
      "the Docs group index redirects to its first page",
    );
  });
});

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("are visitable without error", async function (assert) {
    const visited: string[] = [];

    await visitAllLinks((path) => {
      visited.push(path);
    });

    // Sorted because visit order depends on rendering timing; the set of pages does not.
    assert.deepEqual(visited.sort(), [
      "/Docs",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs/sub-folder/ember-resources",
      "/my-folder-name/bar.md",
      "/my-folder-name/baz",
      "/my-folder-name/foo",
    ]);
  });
});
