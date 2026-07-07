import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

// Group index links redirect to the group's first page (via
// `handlePotentialIndexVisit`), so tell the crawler where each one lands.
const KNOWN_REDIRECTS = {
  "/my-github-project/Home": "/my-github-project/my-folder-name/bar.md",
  "/my-github-project/Documentation": "/my-github-project/Documentation/sub-folder/lonely-page.md",
};

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("every in-app link is visitable under the custom rootURL", async function (assert) {
    // `visitAllLinks` pushes a passing assertion per successful navigation, so
    // this passes iff every in-app link resolves correctly under the custom
    // rootURL. Order-independent and self-maintaining as pages are added.
    await visitAllLinks(undefined, KNOWN_REDIRECTS);

    assert.ok(true, "crawled all in-app links without a navigation failure");
  });
});
