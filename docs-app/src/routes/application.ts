import Route from '@ember/routing/route';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { sentenceCase } from 'change-case';
import { colorScheme, sync } from 'ember-primitives/color-scheme';
import { setupTabster } from 'ember-primitives/tabster';
import { setupKolay } from 'kolay/setup';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

import { nameFor } from '../templates/application.gts';

import type { Manifest } from 'kolay';

sync();

/**
 * Tabster is one instance per window (search results are a mover — see
 * templates/search.gts), so it is set up once for the page rather than once
 * per application instance.
 *
 * The owner would be the obvious context to hand it, but `setupTabster`
 * registers a destructor that disposes tabster, and a test builds and tears
 * down an application instance per test: the second test would set up against
 * the instance the first one disposed, and disposing it again throws `Using
 * disposed Tabster`. This context is never destroyed, which is the lifetime
 * a window-wide singleton actually has.
 */
const TABSTER_HOST = {};
let tabster: Promise<void> | undefined;

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    await (tabster ??= setupTabster(TABSTER_HOST));

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

    const manifest = await setupKolay(this, {
      modules: {
        'ember-modifier': () => import('ember-modifier'),
        'tracked-built-ins': () => import('tracked-built-ins'),
        '#docs/demo-support': () => ({
          nameFor,
          sentenceCase,
        }),
        'babel-plugin-ember-template-compilation': () =>
          import('babel-plugin-ember-template-compilation'),
      },
      rehypePlugins: [
        // @shikijs/rehype
        [
          rehypeShikiFromHighlighter,
          // Options for @shikijs/rehype-
          // https://shiki.matsu.io/packages/rehype#fine-grained-bundle
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
