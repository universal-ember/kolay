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

/**
 * A yielded tuple member (`default: [name: SomeType]`) of the signature under
 * test -- again, the outermost match, so nested signatures don't shadow it.
 */
function member(name: string): Element {
  const members = [...document.querySelectorAll('.typedoc__named-tuple')].filter(
    (el) => !el.closest('.typedoc__nested-signature')
  );
  const found = members.find(
    (el) => el.querySelector('.typedoc__name')?.textContent?.trim() === name
  );

  if (!found) {
    throw new Error(
      `Could not find a rendered "${name}" tuple member. Found: ${members
        .map((el) => el.querySelector('.typedoc__name')?.textContent?.trim())
        .join(', ')}`
    );
  }

  return found;
}

/**
 * The `recursive` marker belonging to `parent` itself, rather than to
 * anything rendered inside it.
 */
function marker(parent: Element): Element | null {
  return parent.querySelector(
    ':scope > .typedoc__property > .typedoc__invokable > .typedoc__recursive'
  );
}

/**
 * The names of the args rendered inside `parent` -- the arg rows only, not
 * the names of the types they're annotated with.
 */
function argNames(parent: Element): string[] {
  return [...parent.querySelectorAll('[class*="-signature__arg"] > .typedoc__name')].map(
    (el) => el.textContent?.trim() ?? ''
  );
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

    // deeper headings belong to the signatures of yielded components, which
    // are subsections of the block that yields them
    const deeper = [...document.querySelectorAll('h4.typedoc__heading')];

    assert.true(
      deeper.every((el) => el.closest('[data-typedoc-nested]')),
      'every deeper heading is inside a yielded signature'
    );
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

  test('a signature that leads back to itself is marked, not repeated', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="ClassC"
          @package="kolay"
        />
      </template>
    );

    // <ClassC> *is* this signature, so rendering it again would repeat the
    // whole page -- it is named and marked instead
    assert.dom(marker(block('namedBlockD'))).exists();
    assert.dom('[data-typedoc-nested]', block('namedBlockD')).doesNotExist();

    // a component that isn't the one being documented still expands
    assert.dom(marker(block('namedBlockE'))).doesNotExist();
    assert.dom('[data-typedoc-nested]', block('namedBlockE')).exists();
  });

  test('expansion stops after one level', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="ClassC"
          @package="kolay"
        />
      </template>
    );

    // <ClassA> expands, and the components *it* yields are named only --
    // what's yielded by what's yielded is a page of its own
    const expansion = block('namedBlockE').querySelector('[data-typedoc-nested]');

    assert.dom(expansion).exists();
    assert.dom('[data-typedoc-nested]', expansion).doesNotExist();
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

    // ... and the <Ping> that <Pong> yields is named, but not expanded again
    assert.dom(yielded).containsText('Ping');
    assert.dom('[data-typedoc-nested]', yielded).exists({ count: 1 });
  });

  test('yielded invokables are labelled with what they are', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="YieldsInvokables"
          @package="kolay"
        />
      </template>
    );

    assert.dom(member('component')).containsText('Component');
    assert.dom(member('modifier')).containsText('Modifier');
    assert.dom(member('helper')).containsText('Helper');
    assert.dom(member('onChange')).containsText('Function');

    // the wrapped signature is rendered, rather than named -- what a
    // consumer is handed is the signature, not `ComponentLike<SignatureA>`
    assert.dom(member('component')).containsText('@foo');
    assert.dom(member('component')).containsText(':namedBlockA');

    // the labels say what the Glint wrappers used to, in plainer words
    assert.dom().doesNotContainText('ComponentLike');
    assert.dom().doesNotContainText('ModifierLike');
    assert.dom().doesNotContainText('HelperLike');
    assert.dom().doesNotContainText('WithBoundArgs');
  });

  test('bound modifiers and helpers render as modifiers and helpers', async function (assert) {
    await render(
      <template>
        <ComponentSignature
          @module="declarations/browser/samples/-private"
          @name="YieldsInvokables"
          @package="kolay"
        />
      </template>
    );

    // a component keeps its name, and its `@`-prefixed args
    assert.dom(member('boundComponent')).containsText('ClassA');
    assert.deepEqual(argNames(member('boundComponent')), ['@bar'], 'only @foo was bound');

    // a modifier keeps its Element, and its positional args
    assert.dom(member('boundModifier')).containsText('Modifier');
    assert.dom(member('boundModifier')).containsText('HTMLDivElement');
    assert.deepEqual(argNames(member('boundModifier')), ['x', 'y'], 'invert was bound');

    // a helper keeps its Return
    assert.dom(member('boundHelper')).containsText('Helper');
    assert.dom(member('boundHelper')).containsText('Return');
    assert.deepEqual(argNames(member('boundHelper')), ['first', 'second'], 'optional was bound');
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
