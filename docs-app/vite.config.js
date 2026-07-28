import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import rehypeShiki from '@shikijs/rehype';
import { apiDocs, demos, docs, importEntrypoints } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';

const sharedMarkdownOptions = {
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
};

export default defineConfig(async ({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      inspect(),
      info(),
      ember(),
      docs('Runtime', {
        src: import.meta.resolve('../docs', import.meta.url),
        ...sharedMarkdownOptions,
      }),
      docs('TypeDoc', {
        src: import.meta.resolve('../docs-typedoc', import.meta.url),
        ...sharedMarkdownOptions,
      }),
      apiDocs(['kolay', 'ember-primitives', 'ember-resources', 'ember-repl']),
      // live codefences import these as '#demos/site/*'
      demos(import.meta.resolve('./demos', import.meta.url), { as: '#demos/site' }),
      // .md fences can import ember-primitives with no modules config
      importEntrypoints('ember-primitives'),
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
