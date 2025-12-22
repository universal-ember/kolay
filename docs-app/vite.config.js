import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';

const validator = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/validator/index.js`;
const tracking = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/tracking/index.js`;
const eUtil = `${process.cwd()}/node_modules/@embroider/util/addon/index.js`;
const cache = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/tracking/primitives/cache.js`;

export default defineConfig((/* { mode } */) => {
  return {
    build: {
      target: ['esnext'],
    },
    resolve: {
      extensions,
      alias: {
        '@glimmer/validator': validator,
        '@glimmer/tracking/primitives/cache': cache,
        '@glimmer/tracking': tracking,
        '@embroider/util': eUtil,
      },
    },
    plugins: [
      info(),
      classicEmberSupport(),
      ember(),
      kolay({
        src: 'public/docs',
        groups: [
          {
            name: 'Runtime',
            src: './node_modules/kolay/docs',
          },
        ],
        packages: ['kolay', 'ember-primitives', 'ember-resources'],
      }),
      babel({
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    optimizeDeps: {
      exclude: [
        'ember-repl > repl-sdk',
        // a wasm-providing dependency
        'content-tag',
        'ember-repl > repl-sdk > content-tag',
        'ember-repl > content-tag',
        // vite doesn't have good web worker-optimization
        'ember-repl > tar-worker',
      ],
      // for top-level-await, etc
      esbuildOptions: {
        target: 'esnext',
      },
    },
  };
});
