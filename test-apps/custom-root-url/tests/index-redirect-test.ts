import { currentURL, visit } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

module("Group index redirects under a custom rootURL", function (hooks) {
  setupApplicationTest(hooks);

  // Guards against a regression where the redirect to a group's first page
  // doubled the rootURL (e.g. `/my-github-project/my-github-project/...`).
  test("visiting a group root redirects to its first page without doubling the rootURL", async function (assert) {
    await visit("/Home");
    assert.strictEqual(
      currentURL(),
      "/my-folder-name/bar.md",
      "the Home group index redirects to its first page (rootURL stripped)",
    );

    await visit("/Documentation");
    assert.strictEqual(
      currentURL(),
      "/Documentation/sub-folder/lonely-page.md",
      "the Documentation group index redirects to its first page (rootURL stripped)",
    );
  });
});
