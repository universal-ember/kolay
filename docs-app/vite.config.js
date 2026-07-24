import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import rehypeShiki from '@shikijs/rehype';
import { docs, typedoc } from 'kolay/vite';
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
      docs({
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
        scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        import { Shadowed } from 'ember-primitives/components/shadowed';
        import { InViewport } from 'ember-primitives/viewport';
        `,
      }),
      typedoc({
        packages: ['kolay', 'ember-primitives', 'ember-resources'],
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
