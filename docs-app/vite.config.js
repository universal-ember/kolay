import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import rehypeShiki from '@shikijs/rehype';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';

export default defineConfig(async ({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      inspect(),
      info(),
      ember(),
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
      babel({
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    build: {
      reportCompressedSize: false,
      ...(isDev ? { minify: false } : { minify: 'oxc' }),
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'unified',
                test: /hast|mdast|remark|rehype|unified|vfile/,
              },
            ],
          },
        },
      },
    },
    optimizeDeps: {
      // Because we use dep injection
      exclude: ['kolay'],
    },
  };
});
