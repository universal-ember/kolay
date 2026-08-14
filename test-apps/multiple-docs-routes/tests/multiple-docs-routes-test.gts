import { currentURL, render, visit } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest, setupRenderingTest } from "ember-qunit";

import { docsManager } from "kolay";
import {
  manifest as demosManifest,
  meta as demosMeta,
  name as demosName,
} from "virtual:kolay/docs/demos";
import { meta as guidesMeta } from "virtual:kolay/docs/guides";

// build-time resolution of a demos() alias: this import is compiled
// like any other module in the app graph
import Hello from "#demos/kit/hello";

module("Multiple docs routes", function (hooks) {
  setupApplicationTest(hooks);

  test("the manifest contains the groups from every docs() usage", async function (assert) {
    await visit("/welcome/home.md");

    const docs = docsManager(this.owner);

    assert.deepEqual(docs.availableGroups, ["Home", "guides", "demos"]);
  });

  test("a group that collects others is one nav entry", async function (assert) {
    await visit("/welcome/home.md");

    const docs = docsManager(this.owner);

    assert.deepEqual(
      docs.navEntries.map((entry) => entry.name),
      ["Home", "Docs"],
      "the collecting group replaces the groups inside it",
    );

    const includer = docs.navEntries[1];

    assert.true(includer?.isCollection);
    assert.deepEqual(
      includer?.groups.map((group) => group.name),
      ["guides", "demos"],
      "the collected groups, in declaration order",
    );
    assert.deepEqual(
      includer?.tree.pages.map((section) => section.name),
      ["guides", "demos"],
      "and the tree is a section per collected group",
    );
    assert.strictEqual(
      includer?.href,
      docs.groupHrefFor("guides"),
      "it links at its landing group, having no pages of its own (that group's mount URL, here)",
    );

    assert.strictEqual(docs.collectionOf("demos"), "Docs");
    assert.strictEqual(docs.collectionOf("Home"), "Home", "nothing collects Home");
  });

  test("collected groups keep their own routes and pages", async function (assert) {
    await visit("/help/getting-started/intro.md");

    const docs = docsManager(this.owner);

    assert.strictEqual(currentURL(), "/help/getting-started/intro.md", "routing is untouched");
    assert.dom("[data-page-error]").doesNotExist();
    assert.strictEqual(docs.selectedGroup, "guides", "the group still resolves per page");
    assert.strictEqual(
      docs.activeNavEntry?.name,
      "Docs",
      "a collected group's page keeps the collecting entry active",
    );
    assert.deepEqual(
      docs.tree.pages.map((section) => section.name),
      ["guides", "demos"],
      "and the page tree is the collecting group's, without the app asking for it",
    );
    assert.deepEqual(
      docs.currentGroup.tree.pages.map((folder) => folder.name),
      ["getting-started"],
      "the group's own tree is still the group's own",
    );
    assert
      .dom('aside nav a[href="/help/getting-started/usage.md"]')
      .exists("a collected group's pages render from that tree, at their own URLs");

    assert
      .dom('header nav a[href="/help"]')
      .exists("one link, for the collecting group")
      .hasClass("active");
    assert
      .dom('header nav a[href="/demos"]')
      .doesNotExist("a collected group has no link of its own");
  });

  test("each docs() usage enables a virtual module with its own manifest", function (assert) {
    assert.strictEqual(demosName, "demos");
    assert.strictEqual(demosManifest.name, "demos");
    assert.deepEqual(
      demosManifest.list.map((page) => page.appRelativePath),
      ["/demos/components/buttons"],
    );
  });

  test("each docs() usage exposes its source's meta", function (assert) {
    assert.strictEqual(demosMeta.url, "https://github.com/universal-ember/kolay");
    assert.strictEqual(demosMeta.docsPath, "test-apps/multiple-docs-routes/demos");
    assert.strictEqual(demosMeta.package, "demo-kit", "meta.jsonc content is mixed in");

    assert.strictEqual(guidesMeta.docsPath, "test-apps/multiple-docs-routes/guides");
    assert.notOk("package" in guidesMeta, "no meta.jsonc, no mixed-in content");
  });

  test("a runtime-compiled fence imports a demos() alias, with no modules config", async function (assert) {
    await visit("/help/getting-started/using-demos.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("[data-demo=hello]").containsText("Hello from a shared demo!");
  });

  test("runtime fences import packages taught by multiple importEntrypoints() usages", async function (assert) {
    await visit("/help/getting-started/using-libraries.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("[data-demo=entrypoints]").containsText("package import resolved");
    assert
      .dom("[data-demo=entrypoints-wildcard]")
      .containsText("wildcard entrypoint resolved", "a './*' subpath is enumerated");
    assert
      .dom("[data-demo=entrypoints-2]")
      .containsText("second usage resolved", "the usages' maps merge");
  });

  test("a co-located page renders from the root mount", async function (assert) {
    await visit("/welcome/home.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Welcome home");
  });

  test("the co-located pages' nav link is the app root, and @homeName names it", async function (assert) {
    await visit("/welcome/home.md");

    assert
      .dom('header nav a[href="/"]')
      .exists("links at the root, where the co-located pages live")
      .hasText("Docs Home", "and @homeName is what names it")
      .hasClass("active", "and reads active while reading one of them");
    assert
      .dom('header nav a[href="/Home"]')
      .doesNotExist("not the group name: no page is served under it");
  });

  test("a .md page renders from the scoped /help mount (group: guides)", async function (assert) {
    await visit("/help/getting-started/intro.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides intro");

    await visit("/help/getting-started/usage.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides usage");
  });

  test("a page renders from a scoped mount regardless of the URL's casing", async function (assert) {
    await visit("/help/getting-started/INTRO.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides intro");
  });

  test("inside a scoped mount, nav links use the mount's URL space", async function (assert) {
    await visit("/help/getting-started/intro.md");

    assert
      .dom('aside nav a[href="/help/getting-started/usage.md"]')
      .exists("page links are mount-space");
    assert
      .dom('aside nav a[href="/help/getting-started/intro.md"]')
      .hasClass("active", "the current page is active");

    assert
      .dom('header nav a[href="/help"]')
      .exists("the group nav points at the mount")
      .hasClass("active", "the mounted group is the selected group");
  });

  // the sibling test above enters through `guides`, which is a *scoped*
  // mount (/help). This one enters through `demos`, an unscoped nested
  // mount, so both mount styles are covered from inside a collection.
  test("a collected group in an unscoped nested mount is presented the same way", async function (assert) {
    await visit("/demos/components/buttons");

    const docs = docsManager(this.owner);

    assert.strictEqual(currentURL(), "/demos/components/buttons", "routing is untouched");
    assert.dom("[data-page-error]").doesNotExist();
    assert.strictEqual(docs.selectedGroup, "demos", "the group still resolves per page");
    assert.strictEqual(
      docs.activeNavEntry?.name,
      "Docs",
      "the collection entry is active from inside a nested mount too",
    );
    assert.deepEqual(
      docs.tree.pages.map((section) => section.name),
      ["guides", "demos"],
      "and the page tree is the collection group's, not this group's own",
    );
    assert.deepEqual(
      docs.currentGroup.tree.pages.map((folder) => folder.name),
      ["components"],
      "while currentGroup.tree is still this group's own",
    );
    assert
      .dom('aside nav a[href="/demos/components/buttons"]')
      .exists("its pages render from the collection group's tree, at the mount's URL");
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
    await visit("/help");

    assert.strictEqual(currentURL(), "/help/getting-started/intro.md", "mount-space redirect");
    assert.dom("h1").containsText("Guides intro");

    await visit("/demos");

    assert.strictEqual(currentURL(), "/demos/components/buttons");
    assert.dom("h1").containsText("Buttons demo");
  });

  // `Docs` collects both groups and has no `src`, so nothing in
  // availableGroups resolves it and it has no mount of its own. Its URL is
  // still reachable by hand, so it lands where its entry links.
  test("visiting a collection group's own URL redirects to where its entry links", async function (assert) {
    await visit("/Docs");

    const docs = docsManager(this.owner);

    assert.strictEqual(
      currentURL(),
      "/help/getting-started/intro.md",
      "the first group it collects, in its mount's URL space",
    );
    assert.dom("[data-page-error]").doesNotExist();
    assert.strictEqual(
      docs.activeNavEntry?.name,
      "Docs",
      "and the entry the reader arrived from is the active one",
    );
  });

  test("visiting a mount's index with a trailing slash also redirects", async function (assert) {
    await visit("/help/");

    assert.strictEqual(
      currentURL(),
      "/help/getting-started/intro.md",
      "mount-space redirect, trailing slash",
    );

    await visit("/demos/");

    assert.strictEqual(currentURL(), "/demos/components/buttons");
  });
});

module("demos() | build-time", function (hooks) {
  setupRenderingTest(hooks);

  test("app code imports a demos() alias directly", async function (assert) {
    await render(<template><Hello /></template>);

    assert.dom("[data-demo=hello]").containsText("Hello from a shared demo!");
  });
});
