import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Runtime docs navigation', function (hooks) {
  setupApplicationTest(hooks);

  test('sections appear in the intended order', async function (assert) {
    await visit('/Runtime/rendering/page.md');

    const nav = document.querySelector('aside nav');
    const text = nav?.textContent?.replaceAll(/\s+/g, ' ') ?? '';

    const sections = ['Rendering', 'Navigation', 'Utilities', 'Demo support'];
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

  test('each group mount has its own design', async function (assert) {
    await visit('/Runtime/rendering/page.md');

    assert.dom('.runtime-doc[data-design="runtime"]').exists();

    await visit('/TypeDoc/components/api-docs.md');

    assert.dom('.typedoc-doc[data-design="typedoc"]').exists();
    assert
      .dom('.typedoc-banner')
      .containsText('Reference', 'the typedoc layout has its own structure');

    await visit('/install/index');

    assert.dom('.home-doc[data-design="home"]').exists();
  });

  test('page links use the invocation style of their APIs', async function (assert) {
    await visit('/Runtime/rendering/page.md');

    for (const label of [
      '<Page>',
      'compiledDoc(...)',
      'Compiled(...)',
      'isActive(...)',
      '<GroupNav />',
      '<PageNav />',
      'handlePotentialIndexVisit(...)',
      'selected(...)',
      'docsManager(...)',
      '<Logs />',
    ]) {
      assert.dom('aside nav').containsText(label);
    }
  });
});
