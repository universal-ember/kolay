import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
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
      // docs, apiDocs, demos, and importEntrypoints, generated from
      // this app's kolay.config.js
      kolay(),
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
