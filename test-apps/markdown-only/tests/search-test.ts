import { click, fillIn, visit, waitFor } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

module("Search", function (hooks) {
  setupApplicationTest(hooks);

  test("searches plain markdown pages after fetching them", async function (assert) {
    await visit("/search?q=resources");
    // the page's text is fetched outside the run loop, so `visit` settling
    // isn't enough — the results render once that fetch resolves
    await waitFor(".search-result a", { timeout: 5000 });

    assert.dom(".search-result a").hasText("Ember resources");
  });

  test("puts the query in the URL", async function (assert) {
    await visit("/search");
    await fillIn('input[aria-label="Search"]', "resources");
    await click('button[type="submit"]');

    assert.strictEqual(this.owner.lookup("service:router").currentURL, "/search?q=resources");
  });
});
