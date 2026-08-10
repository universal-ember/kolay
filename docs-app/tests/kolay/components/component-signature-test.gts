import { render, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { ComponentSignature } from 'kolay';

import { setupKolay } from 'kolay/test-support';

/**
 * The rendered `<:name>` block of the signature under test, so that
 * assertions can be scoped to it. Nested signatures render blocks of their
 * own -- those aren't what a test asks for by name.
 */
function block(name: string): Element {
  const blocks = [...document.querySelectorAll('.typedoc__component-signature__block')].filter(
    (el) => !el.closest('.typedoc__nested-signature')
  );
  const found = blocks.find(
    (el) => el.querySelector('.typedoc__name')?.textContent?.trim() === `<:${name}>`
  );

  if (!found) {
    throw new Error(
      `Could not find a rendered <:${name}> block. Found: ${blocks
        .map((el) => el.querySelector('.typedoc__name')?.textContent?.trim())
        .join(', ')}`
    );
  }

  return found;
}

module('<ComponentSignature>', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test('heading levels are one below the preceding document heading', async function (assert) {
    await render(
      <template>
        <h2>API Reference</h2>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="SignatureA"
          @package="kolay"
        />
      </template>
    );

    // Element, Arguments, Blocks -- all siblings, all one level below the <h2>
    assert.dom('h3.typedoc__heading').exists({ count: 3 });
    assert.dom('h1.typedoc__heading').doesNotExist();
    assert.dom('h2.typedoc__heading').doesNotExist();
    assert.dom('h4.typedoc__heading').doesNotExist();
  });

  test('headings inside declaration comments do not shift the signature headings', async function (assert) {
    await render(
      <template>
        <h2>API Reference</h2>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="SignatureWithCommentHeadings"
          @package="kolay"
        />
      </template>
    );

    // The signature headings are unaffected by the headings
    // that the declaration's comments render before them
    assert.dom('h3.typedoc__heading').exists({ count: 3 });
    assert.dom('h4.typedoc__heading').doesNotExist();
    assert.dom('h5').doesNotExist();

    // The comment-authored headings are rendered, contained
    // in the same <section> as their signature part's heading
    assert.dom('section .typedoc-rendered-comment h4').exists({ count: 2 });
  });

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

    // WithBoundArgs is a Glint implementation detail -- the bound components
    // are rendered as themselves, minus the args that are already bound
    assert.dom().doesNotContainText('WithBoundArgs');
    assert.dom(block('namedBlockC')).containsText('ClassA');
    assert.dom(block('namedBlockD')).containsText('ClassC');
  });

  test('bound args are omitted from the bound component signature', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="ClassC"
          @package="kolay"
        />
      </template>
    );

    // <ClassA> has @foo and @bar -- namedBlockC binds both of them
    assert.dom(block('namedBlockC')).doesNotContainText('@foo');
    assert.dom(block('namedBlockC')).doesNotContainText('@bar');
    assert.dom(block('namedBlockC')).doesNotContainText('Arguments');

    // ... and namedBlockE binds only @foo
    assert.dom(block('namedBlockE')).containsText('Arguments');
    assert.dom(block('namedBlockE')).containsText('@bar');
    assert.dom(block('namedBlockE')).doesNotContainText('@foo');

    // the rest of the bound component's signature is still rendered
    assert.dom(block('namedBlockE')).containsText('HTMLDivElement');
    assert.dom(block('namedBlockE')).containsText(':namedBlockA');
  });

  test('components that yield bound copies of each other stop expanding', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="Ping"
          @package="kolay"
        />
      </template>
    );

    const yielded = block('default');

    // <Pong> is expanded, without the @ping it was given
    assert.dom(yielded).containsText('Pong');
    assert.dom(yielded).containsText('@pong');
    assert.dom(yielded).doesNotContainText('@ping');

    // ... and the <Pong> that the yielded <Ping> yields is named,
    // but not expanded again -- <Pong> is already an ancestor of it
    assert.dom(yielded).containsText('Ping');
    assert.dom('[data-typedoc-expanded]', yielded).exists({ count: 2 });
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

  test('default export renamed', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="ClassE"
          @package="kolay"
        />
      </template>
    );

    // Temporary -- need to figure out what async thing doesn't have a waiter
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    await waitUntil(() => (this as any).element?.textContent?.includes('Arguments'));
    assert.dom().containsText('first DefaultClassA');

    // DefaultClassA isn't exported, so it has no documented signature to
    // render -- but the WithBoundArgs wrapper is still not worth showing
    assert.dom(block('namedBlockB')).containsText('DefaultClassA');
    assert.dom().doesNotContainText('WithBoundArgs');
  });
});
