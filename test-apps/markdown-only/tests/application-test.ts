import { currentURL, visit, waitUntil } from "@ember/test-helpers";
import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { docsManager } from "kolay";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

module("PageNav", function (hooks) {
  setupApplicationTest(hooks);

  // The `:section` block renders headings, not links, so the all-links crawl
  // below cannot see them: rename the block and every heading silently
  // vanishes while the crawl stays green.
  test("renders a heading for each section", async function (assert) {
    await visit("/Docs/sub-folder/ember-primitives.md");

    assert.dom('nav[aria-label="Selected Group"]').includesText("sub-folder");
  });
});

module("Group index redirects", function (hooks) {
  setupApplicationTest(hooks);

  test("visiting a group root redirects to its first page", async function (assert) {
    await visit("/Docs");

    assert.strictEqual(
      currentURL(),
      "/Docs/sub-folder/ember-primitives.md",
      "the Docs group index redirects to its first page",
    );
  });
});

module("Frontmatter", function (hooks) {
  setupApplicationTest(hooks);

  test("is not rendered, and lands on the page's manifest entry", async function (assert) {
    await visit("/my-folder-name/bar.md");
    // the page's text compiles outside the run loop, so `visit` settling
    // isn't enough — the prose renders once compilation resolves
    await waitUntil(() => !document.querySelector(".loading-page"), { timeout: 5000 });

    assert.dom().includesText("this is bar");
    assert.dom().doesNotIncludeText("zebra");
    assert.dom().doesNotIncludeText("author");

    const home = docsManager(this.owner).manifest.groups.find((group) => group.name === "Home");
    const bar = home?.list.find((page) => page.appRelativePath === "/my-folder-name/bar.md");

    assert.deepEqual(bar?.meta, { author: "zebra", reviewed: true });
  });
});

module("All Links", function (hooks) {
  setupApplicationTest(hooks);

  skippable("are visitable without error", async function (assert) {
    const visited: string[] = [];

    await visitAllLinks((path) => {
      visited.push(path);
    });

    assert.deepEqual(visited.sort(), [
      "/Docs",
      "/Docs/sub-folder/ember-primitives.md",
      "/Docs/sub-folder/ember-resources.md",
      "/my-folder-name/bar.md",
      "/my-folder-name/foo.md",
    ]);
  });
});
