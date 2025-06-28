import { render, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
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
          @module="declarations/browser"
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
          @module="declarations/browser/samples/-private"
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
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="ClassA"
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

  test('class:reference', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="ClassB"
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

  test('class:args:reference', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="ClassC"
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
    assert.dom().containsText('WithBoundArgs');
    assert.dom().containsText('ClassA');
  });

  test('template-only:reference', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
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
          @module="declarations/browser/samples/-private"
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

  test('null Element', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="NullElement"
          @package="kolay"
        />
      </template>
    );

    // Temporary -- need to figure out what async thing doesn't have a waiter
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    await waitUntil(() => (this as any).element?.textContent?.includes('Element:hehe'));
    assert.dom().containsText('Element');
    assert.dom().containsText('Element:hehe');
    assert.dom().containsText('null');
    assert.dom().doesNotContainText('Arguments');
    assert.dom().doesNotContainText('Blocks');
  });
});
