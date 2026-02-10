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
      "/my-github-project/Home",
      "/my-github-project/Docs",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/my-folder-name/baz",
      "/my-github-project/my-folder-name/foo",
      "/my-github-project/Home",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/my-folder-name/foo",
      "/my-github-project/Docs",
      "/my-github-project/Docs/sub-folder/ember-primitives.md",
      "/my-github-project/Docs/sub-folder/ember-resources",
      "/my-github-project/Home",
      "/my-github-project/my-folder-name/baz",
      "/my-github-project/Home",
      "/my-github-project/my-folder-name/foo",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/Home",
      "/my-github-project/Home",
      "/my-github-project/Docs/sub-folder/ember-primitives.md",
      "/my-github-project/Home",
      "/my-github-project/Docs/sub-folder/ember-resources",
      "/my-github-project/Docs",
      "/my-github-project/Docs/sub-folder/ember-resources",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/Docs",
      "/my-github-project/my-folder-name/baz",
      "/my-github-project/Docs",
      "/my-github-project/my-folder-name/foo",
      "/my-github-project/my-folder-name/baz",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/Docs/sub-folder/ember-primitives.md",
      "/my-github-project/Docs",
      "/my-github-project/Home",
    ]);
  });
});
