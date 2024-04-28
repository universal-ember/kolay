import Route from '@ember/routing/route';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { colorScheme, sync } from 'ember-primitives/color-scheme';
import { setupKolay } from 'kolay/setup';
import { getHighlighterCore } from 'shiki/core';
import getWasm from 'shiki/wasm';

sync();

import type { Manifest } from 'kolay';

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const highlighter = await getHighlighterCore({
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
      loadWasm: getWasm,
    });

    const manifest = await setupKolay(this, {
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

    return { manifest };
  }
}
