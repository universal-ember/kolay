import { currentURL, render, visit } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest, setupRenderingTest } from "ember-qunit";

// build-time resolution of a demos() alias: this import is compiled
// like any other module in the app graph
import Hello from "virtual:demos/kit/hello";

import { docsManager } from "kolay";
import {
  manifest as demosManifest,
  meta as demosMeta,
  name as demosName,
} from "virtual:kolay/docs/demos";
import { meta as guidesMeta } from "virtual:kolay/docs/guides";

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

  test("a co-located page renders from the root mount", async function (assert) {
    await visit("/welcome/home.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Welcome home");
  });

  test("a .md page renders from the scoped /help mount (group: guides)", async function (assert) {
    await visit("/help/getting-started/intro.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides intro");

    await visit("/help/getting-started/usage.md");

    assert.dom("[data-page-error]").doesNotExist();
    assert.dom("h1").containsText("Guides usage");
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
});

module("demos() | build-time", function (hooks) {
  setupRenderingTest(hooks);

  test("app code imports a demos() alias directly", async function (assert) {
    await render(<template><Hello /></template>);

    assert.dom("[data-demo=hello]").containsText("Hello from a shared demo!");
  });
});
