import { click, fillIn, visit, waitFor } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { searcher } from "kolay";

module("Search", function (hooks) {
  setupApplicationTest(hooks);

  test("searches plain markdown pages after fetching them", async function (assert) {
    await visit("/search?q=resources");
    // the page's text is fetched outside the run loop, so `visit` settling
    // isn't enough — the results render once that fetch resolves
    await waitFor(".search-result a", { timeout: 5000 });

    assert.dom(".search-result a").hasText("ember resources");
  });

  test("frontmatter is not searchable", async function (assert) {
    await visit("/search");

    const search = searcher(this.owner);

    const forBody = await search.search("searchable-body-word");

    assert.true(
      forBody.some((result) => result.appRelativePath === "/my-folder-name/bar.md"),
      "the page's body text matches (its text was fetched)",
    );

    // 'zebra' appears only in the page's frontmatter
    const forFrontmatter = await search.search("zebra");

    assert.false(
      forFrontmatter.some((result) => result.appRelativePath === "/my-folder-name/bar.md"),
      "the page's frontmatter does not match",
    );
  });

  test("puts the query in the URL", async function (assert) {
    await visit("/search");
    await fillIn('input[aria-label="Search"]', "resources");
    await click('button[type="submit"]');

    assert.strictEqual(this.owner.lookup("service:router").currentURL, "/search?q=resources");
  });
});
