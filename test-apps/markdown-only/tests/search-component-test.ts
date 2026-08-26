import {
  click,
  currentURL,
  fillIn,
  find,
  triggerKeyEvent,
  visit,
  waitFor,
  waitUntil,
} from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";

const START = "/Docs/sub-folder/ember-primitives.md";

/**
 * `mod` is Meta on macOS and Control everywhere else -- the same split
 * <Search /> renders in its trigger.
 */
const MOD = navigator.userAgent.includes("Mac OS") ? { metaKey: true } : { ctrlKey: true };

module("<Search />", function (hooks) {
  setupApplicationTest(hooks);

  test("the trigger opens a combobox over the docs", async function (assert) {
    await visit(START);

    assert.dom("dialog.kolay__search").doesNotHaveAttribute("open");

    await click(".kolay__search__trigger");

    assert.dom("dialog.kolay__search").hasAttribute("open");
    assert.dom(".kolay__search__input").hasAttribute("role", "combobox");
    assert.dom(".kolay__search__status").hasText(/Search every guide/);
  });

  test("typing finds a page, and Enter goes to it", async function (assert) {
    await visit(START);
    await click(".kolay__search__trigger");

    await fillIn(".kolay__search__input", "resources");
    // a plain .md page's text is fetched outside the run loop, so settling
    // isn't enough -- the results render once that fetch resolves
    await waitFor(".kolay__search__result", { timeout: 5000 });

    assert.dom(".kolay__search__result__title").hasText("ember resources");
    assert.dom(".kolay__search__result").hasAttribute("role", "option");

    // nothing arrowed: Enter takes the best result
    await triggerKeyEvent(".kolay__search__input", "keydown", "Enter");

    assert.strictEqual(currentURL(), "/Docs/sub-folder/ember-resources.md");
    assert.dom("dialog.kolay__search").doesNotHaveAttribute("open");
  });

  test("a query too short to be useful is not run", async function (assert) {
    await visit(START);
    await click(".kolay__search__trigger");

    await fillIn(".kolay__search__input", "re");

    assert.dom(".kolay__search__result").doesNotExist();
    assert.dom(".kolay__search__status").hasText("Type at least 3 characters.");
  });

  test("a query that matches nothing says so", async function (assert) {
    await visit(START);
    await click(".kolay__search__trigger");

    await fillIn(".kolay__search__input", "zzzznotathinginthedocs");
    // the status says "Searching…" until every page's text has been fetched
    await waitUntil(() => !find(".kolay__search__status")?.textContent?.includes("Searching"), {
      timeout: 5000,
    });

    assert.dom(".kolay__search__result").doesNotExist();
    assert.dom(".kolay__search__status").hasText(/No results/);
  });

  test("the palette says how to leave it", async function (assert) {
    await visit(START);
    await click(".kolay__search__trigger");

    assert.dom(".kolay__search__hint").hasText("press Esc to close");
  });

  test("the clear button empties the query and gives the caret back", async function (assert) {
    await visit(START);
    await click(".kolay__search__trigger");

    assert.dom(".kolay__search__clear").doesNotExist();

    await fillIn(".kolay__search__input", "resources");
    await waitFor(".kolay__search__result", { timeout: 5000 });

    await click(".kolay__search__clear");

    assert.dom(".kolay__search__input").hasValue("");
    assert.dom(".kolay__search__input").isFocused();
    assert.dom(".kolay__search__result").doesNotExist();
    assert.dom(".kolay__search__clear").doesNotExist();
  });

  test("the hotkey opens it from anywhere", async function (assert) {
    await visit(START);

    assert.dom("dialog.kolay__search").doesNotHaveAttribute("open");

    await triggerKeyEvent(document.body, "keydown", "K", MOD);

    assert.dom("dialog.kolay__search").hasAttribute("open");
    assert.dom(".kolay__search__input").isFocused();
  });
});
