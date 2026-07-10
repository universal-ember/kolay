import { visit, waitFor } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

module("Content paths under a custom rootURL", function (hooks) {
  setupApplicationTest(hooks);

  test("authored root-absolute links/images are rebased onto the rootURL; relative ones are left alone", async function (assert) {
    await visit("/Documentation/sub-folder/content-paths.md");
    // Generous timeout: the in-browser markdown compiler can be working
    // through a backlog when this runs after the all-links crawl.
    await waitFor('main img[alt="Ember logo"]', { timeout: 10_000 });

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
    assert
      .dom('main img[alt="Raw HTML logo"]')
      .hasAttribute(
        "src",
        "/my-github-project/Documentation/sub-folder/ember-logo.svg",
        "a root-absolute src in raw inline HTML is rebased too",
      );
  });

  test("build-time compiled .gjs.md pages get their root-absolute paths rebased too", async function (assert) {
    await visit("/Documentation/sub-folder/build-time");
    await waitFor('main img[alt="Build-time tomster"]');

    assert
      .dom('main a[href="/my-github-project/Documentation/sub-folder/lonely-page.md"]')
      .exists("the root-absolute cross-doc link was rebased at build time");
    assert
      .dom('main img[alt="Build-time tomster"]')
      .hasAttribute(
        "src",
        "/my-github-project/Documentation/sub-folder/ember-tomster.svg",
        "the root-absolute image src was rebased at build time",
      );
  });

  test("co-located assets are emitted into the build regardless of extension casing", async function (assert) {
    const response = await fetch("/my-github-project/Documentation/sub-folder/EMBER-LOGO-CAPS.SVG");

    assert.true(response.ok, "an uppercase-extension asset is served from the build output");
  });
});
