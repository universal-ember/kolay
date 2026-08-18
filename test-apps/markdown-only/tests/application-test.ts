import { currentURL, visit } from "@ember/test-helpers";
import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

module("PageNav", function (hooks) {
  setupApplicationTest(hooks);

  // The heading renders the folder's resolved title, which is its cleaned
  // name (dashes become spaces). Rename the `:section` block and every
  // heading silently vanishes while the crawl below stays green.
  test("renders a heading for each section", async function (assert) {
    await visit("/Docs/sub-folder/ember-primitives.md");

    assert.dom('nav[aria-label="Selected Group"]').includesText("Sub folder");
  });
});

module("Group index redirects", function (hooks) {
  setupApplicationTest(hooks);

  test("visiting a group root redirects to its first page", async function (assert) {
    await visit("/Docs");

    assert.strictEqual(
      currentURL(),
      "/Docs/sub-folder/ember-primitives.md",
      "the Docs group index redirects to its first page",
    );
  });
});

module("Redirect precedence", function (hooks) {
  setupApplicationTest(hooks);

  // Without the config redirect in kolay.config.js, this URL would land on
  // the tree's first page, ember-primitives.md.
  test("a configured redirect beats the page-tree redirect", async function (assert) {
    await visit("/Docs/sub-folder");

    assert.strictEqual(currentURL(), "/Docs/sub-folder/ember-resources.md");
  });
});

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("are visitable without error", async function (assert) {
    const visited: string[] = [];

    await visitAllLinks((path) => {
      visited.push(path);
    });

    assert.deepEqual(visited.sort(), [
      "/Docs",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs/sub-folder/ember-resources.md",
      "/my-folder-name/bar.md",
      "/my-folder-name/foo.md",
    ]);
  });
});
