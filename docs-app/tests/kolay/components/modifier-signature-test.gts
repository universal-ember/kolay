import { render } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { ModifierSignature } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('<ModifierSignature>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test('self', async function (assert) {
    // This is not supported
    await render(
      <template>
        <ModifierSignature
          @package="kolay"
          @module="declarations/browser"
          @name="ModifierSignature"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().containsText('Arguments', 'the signatures are similar on purpose');
    assert.dom().doesNotContainText('@package');
    assert.dom().doesNotContainText('@module');
    assert.dom().doesNotContainText('@name');
    assert.dom().doesNotContainText('Blocks');
  });

  test('interface', async function (assert) {
    await render(
      <template>
        <ModifierSignature
          @module="declarations/browser/samples/-private"
          @name="ModifierSignatureA"
          @package="kolay"
        />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().doesNotContainText('Args');
    assert.dom().doesNotContainText('Positional');
    assert.dom().containsText('x');
    assert.dom().containsText('y');
    assert.dom().containsText('invert');
  });

  skip('function:inline', async function (assert) {
    await render(
      <template>
        <ModifierSignature
          @module="declarations/browser/samples/-private"
          @name="functionModifierA"
          @package="kolay"
        />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().doesNotContainText('Args');
    assert.dom().doesNotContainText('Positional');
    assert.dom().containsText('x');
    assert.dom().containsText('y');
    assert.dom().containsText('invert');
  });

  skip('function:implicit', async function (assert) {
    await render(
      <template>
        <ModifierSignature
          @module="declarations/browser/samples/-private"
          @name="functionModifierB"
          @package="kolay"
        />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().doesNotContainText('Args');
    assert.dom().doesNotContainText('Positional');
    assert.dom().containsText('x');
    assert.dom().containsText('y');
    assert.dom().containsText('invert');
  });

  test('ModifierLike', async function (assert) {
    await render(
      <template>
        <ModifierSignature
          @module="declarations/browser/samples/-private"
          @name="functionModifierC"
          @package="kolay"
        />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().doesNotContainText('Args');
    assert.dom().doesNotContainText('Positional');
    assert.dom().containsText('x');
    assert.dom().containsText('y');
    assert.dom().containsText('invert');
  });
});
