import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { visitAllLinks } from "@universal-ember/test-support";

// NOTE: this file is named zz-* so the crawl runs after every other test
// module: fully compiling many pages and then tearing the app down
// mid-flight leaves ember-repl's module-level compiler unable to serve a
// subsequent test app (runtime-compiled pages never render, even with a 10s
// waitFor). That wedge is a pre-existing ember-repl issue, invisible until
// this app had more than one test file — until it's fixed upstream, nothing
// may run after this crawl.
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
    await visitAllLinks(async (path) => {
      assert.step(path);

      // Markdown content compiles asynchronously, and the crawler collects a
      // page's links right after this callback — without a settle delay,
      // in-content links are discovered (or not) depending on timing, making
      // the crawl nondeterministic.
      return new Promise((resolve) => setTimeout(resolve, 250));
    }, KNOWN_REDIRECTS);

    // A snapshot of the crawl: every reachable in-app link, in visit order,
    // once per page it appears on. This intentionally fails when pages or
    // links are added or removed — update the list to match the new reality.
    assert.verifySteps([
      "/my-github-project/Home",
      "/my-github-project/Documentation",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/my-folder-name/baz",
      "/my-github-project/my-folder-name/foo",
      "/my-github-project/Home",
      "/my-github-project/my-folder-name/bar.md",
      "/my-github-project/my-folder-name/foo",
      "/my-github-project/Documentation",
      "/my-github-project/Documentation/sub-folder/lonely-page.md",
      "/my-github-project/Documentation/sub-folder/content-paths.md",
      "/my-github-project/Documentation/sub-folder/ember-primitives.md",
      "/my-github-project/Documentation/sub-folder/ember-resources",
      "/my-github-project/Documentation/sub-folder/build-time",
      "/my-github-project/Home",
      "/my-github-project/Home",
      "/my-github-project/Documentation/sub-folder/lonely-page.md",
      "/my-github-project/Documentation/sub-folder/ember-primitives.md",
      "/my-github-project/Documentation/sub-folder/build-time",
      "/my-github-project/Documentation",
      "/my-github-project/Documentation/sub-folder/ember-resources",
      "/my-github-project/Home",
      "/my-github-project/Documentation/sub-folder/content-paths.md",
      "/my-github-project/Documentation/sub-folder/ember-resources",
      "/my-github-project/Documentation/sub-folder/lonely-page.md",
      "/my-github-project/Home",
      "/my-github-project/Documentation/sub-folder/ember-primitives.md",
      "/my-github-project/Home",
      "/my-github-project/Documentation/sub-folder/ember-resources",
      "/my-github-project/Documentation",
      "/my-github-project/Documentation/sub-folder/build-time",
      "/my-github-project/Documentation/sub-folder/lonely-page.md",
      "/my-github-project/Documentation",
      "/my-github-project/my-folder-name/baz",
      "/my-github-project/Home",
      "/my-github-project/Documentation/sub-folder/build-time",
      "/my-github-project/Documentation/sub-folder/content-paths.md",
      "/my-github-project/Documentation/sub-folder/build-time",
      "/my-github-project/Documentation/sub-folder/ember-primitives.md",
      "/my-github-project/Documentation/sub-folder/lonely-page.md",
      "/my-github-project/my-folder-name/foo",
      "/my-github-project/Documentation/sub-folder/lonely-page.md",
    ]);
  });
});
