import { currentURL, visit } from "@ember/test-helpers";
import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

// Runs before the crawl below on purpose: fully compiling many pages and then
// tearing the app down mid-flight leaves ember-repl's module-level compiler
// unable to serve a subsequent test app, so nothing may run after the crawl.
module("Group index redirects", function (hooks) {
  setupApplicationTest(hooks);

  // The crawl visits `/Docs` and passes either way — it only records paths,
  // and the redirect target shares the `/Docs` prefix it checks against. So
  // this app spent its whole life logging `Page not found for path "/Docs"`
  // with nothing to catch it. Assert the redirect directly instead.
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

    // A snapshot of the crawl: every reachable in-app page. test-support
    // visits each target once, so this is already a set — but it is still in
    // visit order, and that order depends on rendering timing, which this
    // app's runtime-compiled .gjs.md pages make especially loose. Sort it, so
    // the assertion only fails when pages are actually added or removed.
    //
    // `/Home` is absent because the co-located pages' group links at the app
    // root rather than under its own name (0dab708). Nothing replaces it in the
    // list: this app's rootURL is `/`, and the crawler skips a bare `/` as the
    // page it already started on.
    for (const path of [...visited].sort()) assert.step(path);

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
