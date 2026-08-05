import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/owner';
import { render, settled, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { Compiled } from 'kolay';
import { rehypeWrapDemos } from 'kolay/wrap-demo';

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

  module('with rehypeWrapDemos + a WrapDemo in topLevelScope', function (hooks) {
    setupKolay(hooks, {
      rehypePlugins: [rehypeWrapDemos],
      topLevelScope: {
        WrapDemo: <template>
          <section data-demo-wrapper>{{yield}}</section>
        </template>,
      },
    });

    test('a live codefence renders inside the wrapper', async function (assert) {
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

      assert.dom('[data-demo-wrapper] output').containsText('general kenobi');
    });

    test('two documents in a row both render wrapped demos', async function (assert) {
      // Each document renders as its own island (renderComponent has its own
      // program artifacts) -- this catches singleton components (WrapDemo,
      // the user's wrapper) breaking on their second island.
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
      assert.dom('[data-demo-wrapper] output').containsText('obi wan');

      state.who = 'general kenobi';

      await settled();
      await waitUntil(() => state.doc.isReady);
      assert.dom('[data-demo-wrapper] output').containsText('general kenobi');
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
      assert.dom('[data-demo-wrapper]').doesNotExist();
    });
  });

  module('with rehypeWrapDemos and no WrapDemo binding', function (hooks) {
    setupKolay(hooks, {
      rehypePlugins: [rehypeWrapDemos],
    });

    test('the default WrapDemo renders the demo unchanged', async function (assert) {
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

      assert.dom('output').containsText('general kenobi');
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
