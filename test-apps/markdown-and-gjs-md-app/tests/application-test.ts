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
      "/my-folder-name/baz",
      "/my-folder-name/foo",
      "/Home",
      "/my-folder-name/bar.md",
      "/my-folder-name/foo",
      "/Docs",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs/sub-folder/ember-resources",
      "/Home",
      "/my-folder-name/baz",
      "/Home",
      "/my-folder-name/foo",
      "/my-folder-name/bar.md",
      "/Home",
      "/Home",
      "/Docs/sub-folder/ember-primitives.md",
      "/Home",
      "/Docs/sub-folder/ember-resources",
      "/Docs",
      "/Docs/sub-folder/ember-resources",
      "/my-folder-name/bar.md",
      "/Docs",
      "/my-folder-name/baz",
      "/Docs",
      "/my-folder-name/foo",
      "/my-folder-name/baz",
      "/my-folder-name/bar.md",
      "/my-folder-name/bar.md",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs",
      "/Home",
    ]);
  });
});
