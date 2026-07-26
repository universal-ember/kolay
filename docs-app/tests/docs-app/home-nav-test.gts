import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Home docs navigation', function (hooks) {
  setupApplicationTest(hooks);

  test('sections appear in the intended order', async function (assert) {
    await visit('/install/index');

    const nav = document.querySelector('aside nav');
    const text = nav?.textContent?.replaceAll(/\s+/g, ' ') ?? '';

    const sections = ['Install', 'Authoring', 'Development', 'Migrations', 'Ecosystem'];
    const positions = sections.map((section) => text.indexOf(section));

    assert.deepEqual(
      positions.map((position, i) => (position >= 0 ? sections[i] : `missing: ${sections[i]}`)),
      sections,
      'every section is present'
    );

    assert.deepEqual(
      [...positions].sort((a, b) => a - b),
      positions,
      'sections are in order'
    );
  });

  test('the scroll-behavior element is wired up', async function (assert) {
    await visit('/install/index');

    assert.ok(this.owner.lookup('service:memory-scroll'), 'memory-scroll service resolves');
    assert.dom('.mobile-menu-wrapper__content > [aria-hidden]').exists('the keyed element renders');
  });

  test('visiting the root redirects to the first page of the default group', async function (assert) {
    await visit('/');

    assert.strictEqual(currentURL(), '/install/index');
    assert.dom('[data-page-error]').doesNotExist();
    assert.dom().containsText('kolay');
  });

  test('Install is a link to its index page', async function (assert) {
    await visit('/development/rendering-pages');

    assert.dom(`aside nav a[href="/install/index"]`).containsText('Install');
  });

  test('the authoring pages render', async function (assert) {
    for (const [url, heading] of [
      ['/authoring/markdown-features', 'Markdown features'],
      ['/authoring/code-fences', 'Code fences'],
      ['/authoring/extending-markdown', 'Extending markdown'],
      ['/Runtime/rendering/compiled', 'Compiled'],
      ['/migrations/upgrading-from-5x', 'Upgrading from 5.x'],
      ['/ecosystem/memory-scroll', 'memory-scroll'],
      ['/ecosystem/ember-primitives', 'ember-primitives'],
      ['/ecosystem/ember-repl', 'ember-repl'],
      ['/ecosystem/ember-mobile-menu', 'ember-mobile-menu'],
    ]) {
      await visit(url as string);

      assert.dom('[data-page-error]').doesNotExist(`${url} has no error`);
      assert.dom('h1').containsText(heading as string, `${url} renders`);
    }
  });

  test('the links-and-images page renders its image samples', async function (assert) {
    await visit('/authoring/links-and-images');

    assert.dom('[data-page-error]').doesNotExist();
    assert.dom('img[src="/authoring/kolay-logo.svg"]').exists({ count: 1 }, 'root-absolute image');
    assert.dom('img[src="./kolay-logo.svg"]').exists({ count: 1 }, 'relative image');
  });

  test('the apiDocs entry is a nav-only link into the TypeDoc group', async function (assert) {
    await visit('/development/rendering-pages');

    assert
      .dom(`aside nav a[href="/TypeDoc/plugin/api-docs.md"]`)
      .containsText('Configuring apiDocs(...)');

    assert
      .dom(`aside nav a[href="/TypeDoc/plugin/api-docs.md"] svg.link-entry-icon`)
      .exists('link entries carry the icon');

    // the side nav renders twice (desktop + mobile menu) — the point is
    // that no ordinary page picked up the icon
    const marked = [...document.querySelectorAll('aside nav a:has(svg.link-entry-icon)')];

    assert.true(marked.length > 0, 'the link entry is marked');
    assert.deepEqual(
      [...new Set(marked.map((a) => a.getAttribute('href')))],
      ['/TypeDoc/plugin/api-docs.md'],
      'ordinary pages are not marked'
    );

    assert.dom('aside nav').containsText('Configuring docs()');
  });
});
