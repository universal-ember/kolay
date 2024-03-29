import { render } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { ComponentSignature } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('<ComponentSignature>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test('self', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @package="kolay"
          @module="src/browser/re-exports"
          @name="ComponentSignature"
        />
      </template>
    );

    assert.dom().doesNotContainText('Element');
    assert.dom().containsText('Arguments');
    assert.dom().containsText('@package');
    assert.dom().containsText('@module');
    assert.dom().containsText('@name');
    assert.dom().doesNotContainText('Blocks');
  });

  test('interface', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="src/browser/private/samples"
          @name="SignatureA"
          @package="kolay"
        />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().containsText('@foo');
    assert.dom().containsText('@bar');
    assert.dom().containsText('Blocks');
    assert.dom().containsText(':namedBlockA');
    assert.dom().containsText(':namedBlockB');
  });

  test('class:inline', async function (assert) {
    await render(
      <template>
        <ComponentSignature @module="src/browser/private/samples" @name="ClassA" @package="kolay" />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().containsText('@foo');
    assert.dom().containsText('@bar');
    assert.dom().containsText('Blocks');
    assert.dom().containsText(':default');
    assert.dom().containsText(':namedBlockA');
    assert.dom().containsText(':namedBlockB');
  });

  skip('class:reference', async function (assert) {
    await render(
      <template>
        <ComponentSignature @module="src/browser/private/samples" @name="ClassB" @package="kolay" />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().containsText('@foo');
    assert.dom().containsText('@bar');
    assert.dom().containsText('Blocks');
    assert.dom().containsText(':namedBlockA');
    assert.dom().containsText(':namedBlockB');
  });

  skip('template-only:reference', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="src/browser/private/samples"
          @name="TemplateOnlyC"
          @package="kolay"
        />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().containsText('@foo');
    assert.dom().containsText('@bar');
    assert.dom().containsText('Blocks');
    assert.dom().containsText(':namedBlockA');
    assert.dom().containsText(':namedBlockB');
  });

  test('template-only:inline', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="src/browser/private/samples"
          @name="TemplateOnlyD"
          @package="kolay"
        />
      </template>
    );

    assert.dom().containsText('Element');
    assert.dom().containsText('HTMLDivElement');
    assert.dom().containsText('Arguments');
    assert.dom().containsText('@foo');
    assert.dom().containsText('@bar');
    assert.dom().containsText('Blocks');
    assert.dom().containsText(':default');
    assert.dom().containsText(':namedBlockA');
    assert.dom().containsText(':namedBlockB');
  });
});
