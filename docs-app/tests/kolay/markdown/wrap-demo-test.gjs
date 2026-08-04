import { setOwner } from '@ember/owner';
import { find, render, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { Compiled } from 'kolay';
import { wrapDemo } from 'kolay/wrap-demo';

import { setupKolay } from 'kolay/test-support';

module('Markdown | wrapDemo', function (hooks) {
  setupRenderingTest(hooks);
  setupKolay(hooks, { rehypePlugins: [wrapDemo()] });

  async function renderDoc(context, meta) {
    const doc =
      `# Hello there\n` +
      `\n` +
      `\`\`\`hbs live ${meta}\n` +
      '<output>\n' +
      `\tgeneral kenobi\n\n` +
      '</output>\n' +
      '```\n';

    class Demo {
      @use doc = Compiled(() => doc);
    }

    const state = new Demo();

    setOwner(state, context.owner);

    await render(
      <template>
        {{#if state.doc.component}}
          <state.doc.component />
        {{/if}}
      </template>
    );

    await waitUntil(() => state.doc.isReady);

    return state;
  }

  test('wraps a live codefence in a shadow root', async function (assert) {
    await renderDoc(this, '');

    const host = find('kolay-demo-shadow');

    assert.ok(host, 'the placeholder was renamed to the shadow host element');

    await waitUntil(() => host.shadowRoot?.querySelector('output'));

    assert.dom('h1').containsText('Hello there');
    assert.dom('output').doesNotExist();
    assert
      .dom(host.shadowRoot.querySelector('output'))
      .containsText('general kenobi', 'the demo rendered inside the shadow root');
  });

  test('a `no-shadow` fence opts out of wrapping', async function (assert) {
    await renderDoc(this, 'no-shadow');

    assert.dom('h1').containsText('Hello there');
    assert.dom('kolay-demo-shadow').doesNotExist();
    assert.dom('output').containsText('general kenobi');
  });
});
