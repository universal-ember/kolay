import { visit, waitFor } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

const GROUP_NAV = 'nav[aria-label="Groups"]';
const PAGE_NAV = 'nav[aria-label="Selected Group"]';

module("Nav active state under a custom rootURL", function (hooks) {
  setupApplicationTest(hooks);

  test("the current group and page are marked active on a Documentation page", async function (assert) {
    await visit("/Documentation/sub-folder/lonely-page.md");
    await waitFor(`${PAGE_NAV} a`);

    assert
      .dom(`${GROUP_NAV} a[href="/my-github-project/Documentation"]`)
      .hasClass("active", "the selected group's link is active");
    assert
      .dom(`${GROUP_NAV} a[href="/my-github-project/Home"]`)
      .doesNotHaveClass("active", "the other group's link is not active");

    assert
      .dom(`${PAGE_NAV} a[href="/my-github-project/Documentation/sub-folder/lonely-page.md"]`)
      .hasClass("active", "the current page's link is active");
    assert
      .dom(`${PAGE_NAV} a[href="/my-github-project/Documentation/sub-folder/content-paths.md"]`)
      .doesNotHaveClass("active", "a sibling page's link is not active");
  });

  test("the current group and page are marked active on a Home page", async function (assert) {
    await visit("/my-folder-name/bar.md");
    await waitFor(`${PAGE_NAV} a`);

    assert
      .dom(`${GROUP_NAV} a[href="/my-github-project/Home"]`)
      .hasClass("active", "the selected group's link is active");
    assert
      .dom(`${GROUP_NAV} a[href="/my-github-project/Documentation"]`)
      .doesNotHaveClass("active", "the other group's link is not active");

    assert
      .dom(`${PAGE_NAV} a[href="/my-github-project/my-folder-name/bar.md"]`)
      .hasClass("active", "the current page's link is active");
  });

  test("the current page is marked active when visited without the .md extension", async function (assert) {
    await visit("/Documentation/sub-folder/lonely-page");
    await waitFor(`${PAGE_NAV} a`);

    assert
      .dom(`${PAGE_NAV} a[href="/my-github-project/Documentation/sub-folder/lonely-page.md"]`)
      .hasClass("active", "extensionless visits still highlight the page's link");
    assert
      .dom(`${PAGE_NAV} a[href="/my-github-project/Documentation/sub-folder/content-paths.md"]`)
      .doesNotHaveClass("active", "a sibling page's link is not active");
  });
});
