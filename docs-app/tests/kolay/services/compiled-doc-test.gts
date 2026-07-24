import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/owner';
import { render, settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest, setupRenderingTest } from 'ember-qunit';

import { compiledDoc } from 'kolay';

import { setupKolay } from 'kolay/test-support';

module('compiledDoc | docs pages', function (hooks) {
  setupApplicationTest(hooks);

  test('the compiledDoc page renders, including its live demo', async function (assert) {
    await visit('/Runtime/util/compiled-doc.md');

    assert.dom('[data-page-error]').doesNotExist();
    assert.dom('h1').containsText('compiledDoc');
    assert.dom().containsText('even live codefences work');
  });

  test('the selected page renders', async function (assert) {
    await visit('/Runtime/util/selected.md');

    assert.dom('[data-page-error]').doesNotExist();
    assert.dom('h1').containsText('selected');
  });
});

module('compiledDoc', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks);

  test('renders a markdown string', async function (assert) {
    const context = {};

    setOwner(context, this.owner);

    const doc = compiledDoc(context, () => `# Hello there`);

    await render(
      <template>
        {{#if doc.prose}}
          <doc.prose />
        {{/if}}
      </template>
    );

    assert.dom('h1').containsText('Hello there');
    assert.true(doc.isReady);
    assert.false(doc.hasError);
  });

  test('renders a markdown string fetched asynchronously', async function (assert) {
    const context = {};

    setOwner(context, this.owner);

    const doc = compiledDoc(context, () => Promise.resolve(`# From afar`));

    await render(
      <template>
        {{#if doc.isPending}}
          <div data-pending>loading</div>
        {{/if}}
        {{#if doc.prose}}
          <doc.prose />
        {{/if}}
      </template>
    );

    assert.dom('h1').containsText('From afar');
    assert.dom('[data-pending]').doesNotExist();
  });

  test('renders a module with a default-exported component', async function (assert) {
    const context = {};

    setOwner(context, this.owner);

    const AlreadyCompiled = <template>
      <output>general kenobi</output>
    </template>;

    const doc = compiledDoc(context, () => Promise.resolve({ default: AlreadyCompiled }));

    await render(
      <template>
        {{#if doc.prose}}
          <doc.prose />
        {{/if}}
      </template>
    );

    assert.dom('output').containsText('general kenobi');
    assert.strictEqual(doc.prose, AlreadyCompiled);
  });

  test('reloads when tracked data read in the load function changes, keeping the previous document while loading', async function (assert) {
    class State {
      @tracked name = 'one';
    }

    const sources: Record<string, string> = {
      one: `# One`,
      two: `# Two`,
    };

    const state = new State();
    const context = {};

    setOwner(context, this.owner);

    const doc = compiledDoc(context, () => Promise.resolve(sources[state.name] ?? ''));

    await render(
      <template>
        {{#if doc.prose}}
          <doc.prose />
        {{/if}}
      </template>
    );

    assert.dom('h1').containsText('One');

    const before = doc.prose;

    state.name = 'two';

    // While the new document is loading, the previous one is kept
    // (no flash of emptiness)
    assert.strictEqual(doc.prose, before);
    assert.true(doc.isReady);

    await settled();

    assert.dom('h1').containsText('Two');
    assert.notStrictEqual(doc.prose, before);
  });

  test('is pending until the load function returns something', async function (assert) {
    class State {
      @tracked ready = false;
    }

    const state = new State();
    const context = {};

    setOwner(context, this.owner);

    const doc = compiledDoc(context, () => (state.ready ? `# Now ready` : undefined));

    await render(
      <template>
        {{#if doc.isPending}}
          <div data-pending>loading</div>
        {{/if}}
        {{#if doc.prose}}
          <doc.prose />
        {{/if}}
      </template>
    );

    assert.dom('[data-pending]').exists();
    assert.dom('h1').doesNotExist();

    state.ready = true;
    await settled();

    assert.dom('h1').containsText('Now ready');
    assert.dom('[data-pending]').doesNotExist();
  });
});
