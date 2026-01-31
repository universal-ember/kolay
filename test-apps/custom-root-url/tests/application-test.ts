import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

// import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("visitAllLinks needs to support rootURL", function (assert) {
    assert.ok(true);
  });

  // skippable("are visitable without error", async function (assert) {
  //   await visitAllLinks(async (path) => {
  //     assert.step(path);
  //
  //     return new Promise((resolve) => setTimeout(resolve, 250));
  //   });
  //
  //   assert.verifySteps([
  //
  //   ]);
  // });
});
