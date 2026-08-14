import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("are visitable without error", async function (assert) {
    await visitAllLinks(async (path) => {
      assert.step(path);

      return new Promise((resolve) => setTimeout(resolve, 250));
    });

    assert.verifySteps([
      "/Home",
      "/Docs",
      "/my-folder-name/bar.md",
      "/my-folder-name/foo.md",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs/sub-folder/ember-resources.md",
    ]);
  });
});
