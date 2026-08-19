import { currentURL, visit, waitUntil } from "@ember/test-helpers";
import { module, skip, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

import { docsManager } from "kolay";

import { visitAllLinks } from "@universal-ember/test-support";

const skippable = new URLSearchParams(location.search).has("skipAllLinks") ? skip : test;

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

  test("in a .gjs.md: not rendered, and on the page's manifest entry", async function (assert) {
    await visit("/my-folder-name/foo");
    // the page module loads outside the run loop, so `visit` settling
    // isn't enough — the prose renders once that load resolves
    await waitUntil(() => !document.querySelector(".loading-page"), { timeout: 5000 });

    assert.dom().includesText("this is compiled to gjs");
    assert.dom().doesNotIncludeText("gjs-frontmatter");

    const home = docsManager(this.owner).manifest.groups.find((group) => group.name === "Home");
    const foo = home?.list.find((page) => page.appRelativePath === "/my-folder-name/foo");

    assert.deepEqual(foo?.meta, { demo: "gjs-frontmatter" });
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
      "/Docs/sub-folder/ember-resources",
      "/my-folder-name/bar.md",
      "/my-folder-name/baz",
      "/my-folder-name/foo",
    ]);
  });
});
