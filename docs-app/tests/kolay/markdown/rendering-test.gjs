import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/owner';
import { render, settled, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { Compiled } from 'kolay';
import { wrapDemos } from 'kolay/wrap-demo';

import { setupKolay } from 'kolay/test-support';

module('Markdown | Rendering', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    const doc = `# Hello there`;

    class Demo {
      @use doc = Compiled(() => doc);
    }

    const state = new Demo();

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
    const doc =
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

    const state = new Demo();

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

  module('with wrapDemos', function (hooks) {
    setupKolay(hooks, {
      rehypePlugins: [[wrapDemos, { componentName: 'DemoFrame' }]],
      topLevelScope: {
        DemoFrame: <template>
          <section data-demo-frame>{{yield}}</section>
        </template>,
      },
    });

    test('a live codefence renders inside the configured scope binding', async function (assert) {
      const doc =
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

      const state = new Demo();

      setOwner(state, this.owner);

      await render(
        <template>
          {{#if state.doc.component}}
            <state.doc.component />
          {{/if}}
        </template>
      );

      await waitUntil(() => state.doc.isReady);

      assert.dom('[data-demo-frame] output').containsText('general kenobi');
    });

    test('two documents in a row both render wrapped demos', async function (assert) {
      // Each document renders as its own island (renderComponent has its own
      // program artifacts) -- this catches singleton components (the
      // configured wrapper) breaking on their second island.
      const docFor = (who) =>
        `# Hello there\n` +
        `\n` +
        '```gjs live preview\n' +
        '<template>\n' +
        `  <output>${who}</output>\n` +
        '</template>\n' +
        '```\n';

      class Demo {
        @tracked who = 'obi wan';

        @use doc = Compiled(() => docFor(this.who));
      }

      const state = new Demo();

      setOwner(state, this.owner);

      await render(
        <template>
          {{#if state.doc.component}}
            <state.doc.component />
          {{/if}}
        </template>
      );

      await waitUntil(() => state.doc.isReady);
      assert.dom('[data-demo-frame] output').containsText('obi wan');

      state.who = 'general kenobi';

      await settled();
      await waitUntil(() => state.doc.isReady);
      assert.dom('[data-demo-frame] output').containsText('general kenobi');
    });

    test('non-live content is not wrapped', async function (assert) {
      const doc = `# Hello there`;

      class Demo {
        @use doc = Compiled(() => doc);
      }

      const state = new Demo();

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
      assert.dom('[data-demo-frame]').doesNotExist();
    });
  });

  module('with wrapDemos and an eachDemo.exclude meta', function (hooks) {
    setupKolay(hooks, {
      rehypePlugins: [
        [wrapDemos, { componentName: 'DemoFrame', eachDemo: { exclude: 'no-frame' } }],
      ],
      topLevelScope: {
        DemoFrame: <template>
          <section data-demo-frame>{{yield}}</section>
        </template>,
      },
    });

    test('an excluded fence is not wrapped, the others are', async function (assert) {
      const doc =
        '```hbs live no-shadow\n' +
        '<output>wrapped</output>\n' +
        '```\n' +
        `\n` +
        '```hbs live no-shadow no-frame\n' +
        '<output>bare</output>\n' +
        '```\n';

      class Demo {
        @use doc = Compiled(() => doc);
      }

      const state = new Demo();

      setOwner(state, this.owner);

      await render(
        <template>
          {{#if state.doc.component}}
            <state.doc.component />
          {{/if}}
        </template>
      );

      await waitUntil(() => state.doc.isReady);

      assert.dom('[data-demo-frame]').exists({ count: 1 });
      assert.dom('[data-demo-frame] output').containsText('wrapped');
    });
  });

  module('with custom topLevelScope', function (hooks) {
    setupKolay(hooks, {
      topLevelScope: {
        Response: <template>
          <output>general kenobi</output>
        </template>,
      },
    });

    test('it renders a live codefence with one of the global components', async function (assert) {
      const doc =
        `# Hello there\n` +
        `\n` +
        '```hbs live no-shadow\n' +
        '\n' +
        '<hr>\n' +
        '<Response />\n' +
        '<hr>\n' +
        '```\n';

      class Demo {
        @use doc = Compiled(doc);
      }

      const state = new Demo();

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
});
