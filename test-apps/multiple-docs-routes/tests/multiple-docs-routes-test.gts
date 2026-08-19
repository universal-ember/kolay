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

  // What the page-tree redirect leans on when a mount is scoped: it resolves
  // a group's prefix from its tree rather than assuming the prefix is the
  // group's name. That assumption holds for every named group and fails for
  // the co-located one, which is called Home and lives at the root.
  test("the co-located group's prefix is the root, not its name", async function (assert) {
    await visit("/welcome/home.md");

    const docs = docsManager(this.owner);

    assert.strictEqual(docs.groupFor("Home").tree.appRelativePath, "/");
    assert.strictEqual(docs.groupFor("guides").tree.appRelativePath, "/guides");
  });

  test("a scoped mount's page-tree URL redirects to its first page", async function (assert) {
    await visit("/help/getting-started");

    assert.strictEqual(
      currentURL(),
      "/help/getting-started/intro.md",
      "redirects in mount space, not manifest space",
    );
    assert.dom("h1").containsText("Guides intro");
  });

  test("an unscoped nested mount's page-tree URL redirects to its first page", async function (assert) {
    await visit("/demos/components");

    assert.strictEqual(currentURL(), "/demos/components/buttons");
  });

  // `addRoutes(context, groupName)` stores whatever the app author passed —
  // the manifest is not loaded at router-map time, so nothing validates it
  // there. Every app here mounts through the generated virtual module, where
  // the name matches by construction, so only a direct call reaches this.
  test("a scoping group name is matched case-insensitively", async function (assert) {
    await visit("/welcome/home.md");

    const docs = docsManager(this.owner);
    const indexPage = docs.indexPageForPath("/guides/getting-started", "GUIDES");

    assert.strictEqual(indexPage?.appRelativePath, "/guides/getting-started/intro.md");

    assert.strictEqual(
      docs.indexPageForPath("/guides/getting-started", "not-a-group"),
      undefined,
      "an unknown group answers nothing rather than widening to every group",
    );
  });

  // `app/templates/guides/getting-started/` puts a co-located folder at the
  // same manifest path the scoped `guides` group occupies, because the
  // co-located group's pages live at the root. Searching every group would
  // answer with whichever was enumerated first.
  test("a scoped mount resolves inside its own group, not a group that shadows it", async function (assert) {
    await visit("/help/getting-started");

    assert.strictEqual(currentURL(), "/help/getting-started/intro.md");
    assert.dom("h1").containsText("Guides intro");
  });

  test("a scoped mount's page-tree URL redirects when reached from inside the mount", async function (assert) {
    await visit("/help/getting-started/intro.md");
    await visit("/help/getting-started");

    assert.strictEqual(currentURL(), "/help/getting-started/intro.md");
    assert.dom("[data-page-error]").doesNotExist();
  });

  test("an unscoped nested mount's page-tree URL redirects when reached from inside the mount", async function (assert) {
    await visit("/demos/components/buttons");
    await visit("/demos/components");

    assert.strictEqual(currentURL(), "/demos/components/buttons");
    assert.dom("[data-page-error]").doesNotExist();
  });

  // The mount's own URL, which carries no wildcard param. Ember does not
  // re-enter an active mount route, so a hook on it never fires for these —
  // and the group's own nav link points here from every page inside the mount.
  test("a mount's own URL redirects when reached from inside the mount", async function (assert) {
    await visit("/help/getting-started/intro.md");
    await visit("/help");

    assert.strictEqual(currentURL(), "/help/getting-started/intro.md", "scoped mount");

    await visit("/demos/components/buttons");
    await visit("/demos");

    assert.strictEqual(currentURL(), "/demos/components/buttons", "unscoped nested mount");
  });

  // The co-located group's pages live at the root, so nothing is mounted at
  // `/Home` and no page tree sits there — the path lookup declines it. Only
  // resolving the wildcard as a *group name* answers, which is what
  // `handlePotentialIndexVisit` used to be needed for.
  test("a group whose pages live at the root redirects from its own name", async function (assert) {
    await visit("/Home");

    assert.strictEqual(currentURL(), "/welcome/home.md");
    assert.dom("[data-page-error]").doesNotExist();
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
