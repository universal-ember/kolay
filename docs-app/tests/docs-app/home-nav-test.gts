import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Home docs navigation', function (hooks) {
  setupApplicationTest(hooks);

  test('sections appear in the intended order', async function (assert) {
    await visit('/install/index');

    const nav = document.querySelector('aside nav');
    const text = nav?.textContent?.replaceAll(/\s+/g, ' ') ?? '';

    const sections = ['Install', 'Authoring', 'Development', 'Plugins'];
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

  test('Install is a link to its index page', async function (assert) {
    await visit('/development/rendering-pages');

    assert.dom(`aside nav a[href="/install/index"]`).containsText('Install');
  });

  test('the typedoc entry is a nav-only link into the TypeDoc group', async function (assert) {
    await visit('/development/rendering-pages');

    assert
      .dom(`aside nav a[href="/TypeDoc/plugin/typedoc.md"]`)
      .containsText('Configuring typedoc(...)');

    assert.dom('aside nav').containsText('Configuring docs()');
  });
});
