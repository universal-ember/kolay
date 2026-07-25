import { currentURL, visit } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

module("Virtual routes only", function (hooks) {
  setupApplicationTest(hooks);

  test("the root belongs to the app — no docs routing, no redirect", async function (assert) {
    await visit("/");

    assert.strictEqual(currentURL(), "/", "no redirect away from the app's index");
    assert.dom("[data-app-landing]").containsText("This app owns its root");
    assert.dom("[data-page-error]").doesNotExist();
  });

  test("the group's pages are served from its virtual-module mount", async function (assert) {
    await visit("/help/getting-started/intro.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides intro");
  });

  test("visiting the mount's index redirects to the group's first page", async function (assert) {
    await visit("/help");

    assert.strictEqual(currentURL(), "/help/getting-started/intro.md");
    assert.dom("h1").containsText("Guides intro");
  });
});
