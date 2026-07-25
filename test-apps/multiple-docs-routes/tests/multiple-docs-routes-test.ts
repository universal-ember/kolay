import { currentURL, visit } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { docsManager } from "kolay";

module("Multiple docs routes", function (hooks) {
  setupApplicationTest(hooks);

  test("the manifest contains the groups from every docs() usage", async function (assert) {
    await visit("/welcome/home.md");

    const docs = docsManager(this.owner);

    assert.deepEqual(docs.availableGroups, ["Home", "guides", "demos"]);
  });

  test("a co-located page renders from the root mount", async function (assert) {
    await visit("/welcome/home.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Welcome home");
  });

  test("a .md page renders from the guides mount", async function (assert) {
    await visit("/guides/getting-started/intro.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides intro");

    await visit("/guides/getting-started/usage.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides usage");
  });

  test("a .gjs.md page (with a live codefence) renders from the demos mount", async function (assert) {
    await visit("/demos/components/buttons");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Buttons demo");
    assert.dom("[data-live-demo]").containsText("click me");
    assert
      .dom("[data-callout]")
      .containsText("from this usage's scope", "per-usage scope applies to this usage's files");
  });

  test("visiting a mount's index redirects to the first page in its group", async function (assert) {
    await visit("/guides");

    const docs = docsManager(this.owner);
    const first = docs.groupFor("guides").list[0];

    assert.strictEqual(currentURL(), first?.appRelativePath);
    assert.dom("h1").containsText("Guides intro");

    await visit("/demos");

    assert.strictEqual(currentURL(), "/demos/components/buttons");
    assert.dom("h1").containsText("Buttons demo");
  });
});
