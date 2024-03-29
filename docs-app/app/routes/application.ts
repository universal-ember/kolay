import Route from '@ember/routing/route';
import { service } from '@ember/service';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { colorScheme, sync } from 'ember-primitives/color-scheme';
import { getHighlighterCore } from 'shiki/core';
import getWasm from 'shiki/wasm';

sync();

import type { DocsService, Manifest } from 'kolay';

export default class ApplicationRoute extends Route {
  @service('kolay/docs') declare docs: DocsService;

  async model(): Promise<{ manifest: Manifest }> {
    const highlighter = await getHighlighterCore({
      themes: [import('shiki/themes/github-dark.mjs'), import('shiki/themes/github-light.mjs')],
      langs: [
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/glimmer-js.mjs'),
        import('shiki/langs/glimmer-ts.mjs'),
        import('shiki/langs/handlebars.mjs'),
        import('shiki/langs/jsonc.mjs'),
      ],
      loadWasm: getWasm,
    });

    await this.docs.setup({
      resolve: {
        'ember-primitives': import('ember-primitives'),
        kolay: import('kolay'),
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

    return { manifest: this.docs.manifest };
  }
}
