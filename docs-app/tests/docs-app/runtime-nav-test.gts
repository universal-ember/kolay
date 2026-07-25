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
    assert.dom('.runtime-doc .guide-eyebrow').containsText('Guide');

    await visit('/TypeDoc/components/api-docs.md');

    assert.dom('.typedoc-doc[data-design="typedoc"]').exists();
    assert
      .dom('.typedoc-doc .term__title')
      .containsText('api reference', 'the typedoc layout has its own structure');
    assert.dom('.typedoc-doc .guide-sheet').doesNotExist('designs are not shared');

    await visit('/install/index');

    assert.dom('.home-doc[data-design="home"]').exists();
  });

  test('the Compiled page shows the CompileState it gives back', async function (assert) {
    await visit('/Runtime/rendering/compiled.md');

    assert.dom('[data-page-error]').doesNotExist();

    const section = [...document.querySelectorAll('h3')].find((h3) =>
      h3.textContent?.includes('CompileState')
    );

    assert.ok(section, 'the CompileState section exists');

    for (const field of ['component', 'error', 'isReady', 'promise', 'reason']) {
      assert.dom('.runtime-doc').containsText(field);
    }
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

  test('the selected page shows the Selected store it returns', async function (assert) {
    await visit('/Runtime/utilities/selected.md');

    assert.dom('[data-page-error]').doesNotExist();

    const section = [...document.querySelectorAll('h3')].find((h3) =>
      h3.textContent?.includes('Selected')
    );

    assert.ok(section, 'the Selected section exists');

    for (const member of ['doc', 'prose', 'isReady', 'isPending', 'hasError', 'error']) {
      assert.dom('.runtime-doc').containsText(member);
    }

    assert
      .dom('.runtime-doc')
      .containsText(
        'A human-readable error message',
        'accessor doc comments render (they live on the get signature)'
      );

    assert.dom('.runtime-doc').doesNotContainText('router', 'private members stay hidden');
  });
});
