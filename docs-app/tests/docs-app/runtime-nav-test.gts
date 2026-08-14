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

    // each design's class names are scoped to its own template, so the
    // designs are addressed here the way app.css addresses them: by attribute
    assert.dom('[data-design="runtime"]').exists();
    assert.dom('[data-design="runtime"] > p:first-child').containsText('Guide');

    await visit('/TypeDoc/components/api-docs.md');

    assert.dom('[data-design="typedoc"]').exists();
    assert
      .dom('[data-design="typedoc"] header code')
      .containsText('api reference', 'the typedoc layout has its own structure');
    assert.dom('[data-design="typedoc"] [data-design]').doesNotExist('designs are not shared');

    await visit('/install/index');

    assert.dom('[data-design="home"]').exists();
  });

  test('the Compiled page shows the CompileState it gives back', async function (assert) {
    await visit('/Runtime/rendering/compiled.md');

    assert.dom('[data-page-error]').doesNotExist();

    const label = [...document.querySelectorAll('.typedoc__declaration-name')].find(
      (name) => name.textContent?.trim() === 'CompileState'
    );

    assert.ok(label, 'CompileState renders, labeled once by the declaration');

    for (const field of ['component', 'error', 'isReady', 'promise', 'reason']) {
      assert.dom('[data-design="runtime"]').containsText(field);
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

    const label = [...document.querySelectorAll('.typedoc__declaration-name')].find(
      (name) => name.textContent?.trim() === 'Selected'
    );

    assert.ok(label, 'Selected renders, labeled once by the declaration');

    for (const member of ['doc', 'prose', 'isReady', 'isPending', 'hasError', 'error']) {
      assert.dom('[data-design="runtime"]').containsText(member);
    }

    assert
      .dom('[data-design="runtime"]')
      .containsText(
        'A human-readable error message',
        'accessor doc comments render (they live on the get signature)'
      );

    assert
      .dom('[data-design="runtime"]')
      .doesNotContainText('router', 'private members stay hidden');
  });

  test('the docsManager page shows the DocsService store it returns', async function (assert) {
    await visit('/Runtime/utilities/docs-manager.md');

    assert.dom('[data-page-error]').doesNotExist();

    const labels = [
      ...document.querySelectorAll(
        '[data-design="runtime"] h1, [data-design="runtime"] h2, [data-design="runtime"] h3, [data-design="runtime"] .typedoc__declaration-name'
      ),
    ]
      .map((el) => el.textContent?.trim())
      .filter((text) => text === 'DocsService');

    assert.deepEqual(labels, ['DocsService'], 'DocsService is labeled exactly once');

    for (const member of [
      'manifest',
      'pages',
      'tree',
      'selectedGroup',
      'availableGroups',
      'currentGroup',
      'groupFor',
      'groupForURL',
      'findByPath',
      'hrefFor',
      'appRelativeHrefFor',
      'groupHrefFor',
      'selectGroup',
    ]) {
      assert.dom('[data-design="runtime"]').containsText(member);
    }

    assert
      .dom('[data-design="runtime"]')
      .doesNotContainText('PREPARE_DOCS', 'internal wiring stays hidden');
  });
});
