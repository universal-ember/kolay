import { visit } from "@ember/test-helpers";
import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

module("PageNav", function (hooks) {
  setupApplicationTest(hooks);

  // The `:section` block renders headings, not links, so the all-links crawl
  // below cannot see them: rename the block and every heading silently
  // vanishes while the crawl stays green.
  test("renders a heading for each section", async function (assert) {
    await visit("/Docs/sub-folder/ember-primitives.md");

    assert.dom('nav[aria-label="Selected Group"]').includesText("sub-folder");
  });
});

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("are visitable without error", async function (assert) {
    await visitAllLinks(async (path) => {
      assert.step(path);

      return new Promise((resolve) => setTimeout(resolve, 250));
    });

    // The co-located pages' link is the app root now, rather than `/Home`
    // where nothing is served — so the crawl no longer visits `/Home`, and
    // the root sends it on to the first group.
    assert.verifySteps([
      "/Docs",
      "/my-folder-name/bar.md",
      "/my-folder-name/foo.md",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs/sub-folder/ember-resources.md",
    ]);
  });
});
