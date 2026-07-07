import { visit, waitFor } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

module("Content paths under a custom rootURL", function (hooks) {
  setupApplicationTest(hooks);

  test("authored root-absolute links/images are rebased onto the rootURL; relative ones are left alone", async function (assert) {
    await visit("/Documentation/sub-folder/content-paths.md");
    await waitFor('main img[alt="Ember logo"]');

    assert
      .dom('main a[href="/my-github-project/Documentation/sub-folder/lonely-page.md"]')
      .exists("the root-absolute cross-doc link was rebased onto the rootURL");
    assert
      .dom('main img[alt="Ember logo with Tomster the hamster"]')
      .hasAttribute(
        "src",
        "/my-github-project/Documentation/sub-folder/ember-tomster.svg",
        "the root-absolute image src was rebased onto the rootURL",
      );
    assert
      .dom('main img[alt="Ember logo"]')
      .hasAttribute("src", "./ember-logo.svg", "the relative image src is left untouched");
  });
});
