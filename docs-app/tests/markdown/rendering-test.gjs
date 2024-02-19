import { setOwner } from '@ember/owner';
import { render, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { Compiled } from 'kolay';

module('Markdown | Rendering', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    let doc = `# Hello there`;

    class Demo {
      @use doc = Compiled(() => doc);
    }

    let state = new Demo();

    setOwner(state, this.owner);

    await render(
      <template>
        {{#if state.doc.component}}
          <state.doc.component />
        {{/if}}
      </template>
    );

    await waitUntil(() => state.doc.isReady);

    assert.dom('h1').containsText('Hello there');
  });

  test('it renders a live codefence', async function (assert) {
    let doc =
      `# Hello there\n` +
      `\n` +
      '```hbs live no-shadow\n' +
      '<output>\n' +
      `\tgeneral kenobi\n\n` +
      '</output>\n' +
      '```\n';

    class Demo {
      @use doc = Compiled(() => doc);
    }

    let state = new Demo();

    setOwner(state, this.owner);

    await render(
      <template>
        {{#if state.doc.component}}
          <state.doc.component />
        {{/if}}
      </template>
    );

    await waitUntil(() => state.doc.isReady);

    assert.dom('h1').containsText('Hello there');
    assert.dom('output').containsText('general kenobi');
  });

  test('it renders a live codefence with one of the global components', async function (assert) {
    const Response = <template>
      <output>general kenobi</output>
    </template>;

    let doc =
      `# Hello there\n` +
      `\n` +
      '```hbs live no-shadow\n' +
      '\n' +
      '<hr>\n' +
      '<Response />\n' +
      '<hr>\n' +
      '```\n';

    class Demo {
      @use doc = Compiled(() => doc, {
        topLevelScope: { Response },
      });
    }

    let state = new Demo();

    setOwner(state, this.owner);

    await render(
      <template>
        {{#if state.doc.component}}
          <state.doc.component />
        {{/if}}
      </template>
    );

    await waitUntil(() => state.doc.isReady);

    assert.dom('h1').containsText('Hello there');
    assert.dom('output').containsText('general kenobi');
  });
});
