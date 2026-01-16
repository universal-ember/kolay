import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { setupKolay } from 'kolay/setup';
import { Page } from 'kolay/components';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { colorScheme, sync } from 'ember-primitives/color-scheme';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

sync();

/**
 * Component that initializes kolay and renders a documentation page
 */
export default class KolayPageWithSetup extends Component {
  @tracked isReady = false;
  @tracked error: Error | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);
    this.initializeKolay();
  }

  async initializeKolay() {
    try {
      const highlighter = await createHighlighterCore({
        themes: [import('shiki/themes/github-dark.mjs'), import('shiki/themes/github-light.mjs')],
        langs: [
          import('shiki/langs/javascript.mjs'),
          import('shiki/langs/typescript.mjs'),
          import('shiki/langs/bash.mjs'),
          import('shiki/langs/css.mjs'),
          import('shiki/langs/html.mjs'),
          import('shiki/langs/markdown.mjs'),
          import('shiki/langs/glimmer-js.mjs'),
          import('shiki/langs/glimmer-ts.mjs'),
          import('shiki/langs/handlebars.mjs'),
          import('shiki/langs/jsonc.mjs'),
        ],
        engine: createOnigurumaEngine(() => import('shiki/wasm')),
      });

      await setupKolay(this, {
        modules: {
          'ember-primitives': () => import('ember-primitives'),
          'ember-modifier': () => import('ember-modifier'),
          'tracked-built-ins': () => import('tracked-built-ins'),
          'babel-plugin-ember-template-compilation': () =>
            import('babel-plugin-ember-template-compilation'),
        },
        rehypePlugins: [
          [
            rehypeShikiFromHighlighter,
            highlighter,
            {
              defaultColor: colorScheme.current === 'dark' ? 'dark' : 'light',
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
            },
          ],
        ],
      });

      this.isReady = true;
    } catch (e) {
      this.error = e as Error;
      console.error('Failed to initialize kolay:', e);
    }
  }

  <template>
    {{#if this.error}}
      <div style="border: 1px solid red; padding: 1rem;" data-page-error>
        Error initializing kolay: {{this.error.message}}
      </div>
    {{else if this.isReady}}
      <Page />
    {{else}}
      <div class="loading-page">
        Loading documentation...
        <div aria-busy="true"></div>
      </div>
    {{/if}}
  </template>
}
