import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import rehypeShiki from '@shikijs/rehype';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';

export default defineConfig(async (/* { mode } */) => {
  return {
    plugins: [
      inspect(),
      info(),
      ember(),
      babel({
        babelHelpers: 'runtime',
        extensions,
      }),
      kolay({
        groups: [
          {
            name: 'Runtime',
            src: import.meta.resolve('../docs', import.meta.url),
          },
        ],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
              defaultColor: 'light-dark()',
            },
          ],
        ],
        packages: ['kolay', 'ember-primitives', 'ember-resources'],
        scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        import { Shadowed } from 'ember-primitives/components/shadowed';
        import { InViewport } from 'ember-primitives/viewport';
        `,
      }),
    ],
    optimizeDeps: {
      // Because we use dep injection
      exclude: ['kolay'],
    },
  };
});
