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
      "/Documentation/top.md",
      "the Documentation group index redirects to its first page (rootURL stripped)",
    );
  });

  test("visiting a group root with a trailing slash also redirects to its first page", async function (assert) {
    await visit("/Home/");
    assert.strictEqual(
      currentURL(),
      "/my-folder-name/bar.md",
      "trailing slash doesn't break the redirect",
    );

    await visit("/Documentation/");
    assert.strictEqual(
      currentURL(),
      "/Documentation/top.md",
      "trailing slash doesn't break the redirect",
    );
  });

  // A folder's own URL follows the same rule one level down, and has the
  // same rootURL-doubling hazard.
  test("visiting a folder root redirects to its first page without doubling the rootURL", async function (assert) {
    await visit("/Documentation/sub-folder");
    assert.strictEqual(
      currentURL(),
      "/Documentation/sub-folder/lonely-page.md",
      "the folder index redirects to its first page (rootURL stripped)",
    );
  });

  // The guard that keeps the folder redirect from swallowing ordinary
  // navigation: a page visit lands on the wildcard's index too.
  test("visiting a page leaves it where it is", async function (assert) {
    await visit("/Documentation/sub-folder/ember-primitives.md");
    assert.strictEqual(currentURL(), "/Documentation/sub-folder/ember-primitives.md");
  });

  test("visiting a group root with different casing still redirects to its first page", async function (assert) {
    await visit("/home");
    assert.strictEqual(
      currentURL(),
      "/my-folder-name/bar.md",
      "the group name is matched case-insensitively",
    );

    await visit("/DOCUMENTATION");
    assert.strictEqual(
      currentURL(),
      "/Documentation/top.md",
      "the group name is matched case-insensitively",
    );
  });
});
