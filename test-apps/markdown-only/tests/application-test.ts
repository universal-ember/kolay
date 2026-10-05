import { currentURL, visit, waitUntil } from "@ember/test-helpers";
import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { docsManager } from "kolay";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

module("PageNav", function (hooks) {
  setupApplicationTest(hooks);

  // The heading renders the folder's resolved title, which is its cleaned
  // name (dashes become spaces). Rename the `:section` block and every heading
  // disappears with nothing else to catch it — the crawl below follows links.
  test("renders a heading for each section", async function (assert) {
    await visit("/Docs/sub-folder/ember-primitives.md");

    assert.dom('nav[aria-label="Selected Group"]').includesText("Sub folder");
  });

  // Every app here passes its own `:page` block, so the default rendering had
  // no coverage at all. It renders the page's resolved title, matching what
  // the section heading does — `ember-primitives.md` is titled `# inIframe`,
  // so a filename would be plainly visible here.
  test("with no blocks, page links render resolved titles", async function (assert) {
    await visit("/Docs/sub-folder/ember-primitives.md");

    assert.dom("[data-test-default-blocks]").includesText("inIframe");
    assert.dom("[data-test-default-blocks]").includesText("cell");
    assert
      .dom("[data-test-default-blocks]")
      .doesNotIncludeText("ember-primitives", "the filename is not what a reader sees");
  });
});

module("Group index redirects", function (hooks) {
  setupApplicationTest(hooks);

  test("visiting a group root redirects to its first page", async function (assert) {
    await visit("/Docs");

    assert.strictEqual(
      currentURL(),
      "/Docs/top.md",
      "the Docs group index redirects to its first page",
    );
  });
});

module("Redirect precedence", function (hooks) {
  setupApplicationTest(hooks);

  // Without the config redirect in kolay.config.js, this URL would land on
  // the tree's first page, ember-primitives.md.
  test("a configured redirect beats the page-tree redirect", async function (assert) {
    await visit("/Docs/sub-folder");

    assert.strictEqual(currentURL(), "/Docs/sub-folder/ember-resources.md");
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

module("Pages at the root of a docs source", function (hooks) {
  setupApplicationTest(hooks);

  // docs/top.md has no folder of its own: it belongs to the source itself,
  // and sits in the nav next to the folders.
  test("a top-level markdown file is a page", async function (assert) {
    await visit("/Docs/top.md");
    await waitUntil(() => !document.querySelector(".loading-page"), { timeout: 5000 });

    assert.dom("h1").hasText("Top level", "the top-level page's content is rendered");
    assert
      .dom('nav[aria-label="Selected Group"] a[href="/Docs/top.md"]')
      .exists("the top-level page is linked from the page nav");
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
      "/Docs/top.md",
      "/my-folder-name/bar.md",
      "/my-folder-name/foo.md",
    ]);
  });
});
