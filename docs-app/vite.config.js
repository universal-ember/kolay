import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';

// const validator = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/validator/index.js`;
// const tracking = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/tracking/index.js`;
// const eUtil = `${process.cwd()}/node_modules/@embroider/util/addon/index.js`;
// const cache = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/tracking/primitives/cache.js`;

export default defineConfig((/* { mode } */) => {
  return {
    build: {
      target: ['esnext'],
    },
    resolve: {
      extensions,
      // alias: {
      //   '@glimmer/validator': validator,
      //   '@glimmer/tracking/primitives/cache': cache,
      //   '@glimmer/tracking': tracking,
      //   '@embroider/util': eUtil,
      // },
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
      // a wasm-providing dependency
      exclude: ['content-tag'],
      // for top-level-await, etc
      esbuildOptions: {
        target: 'esnext',
      },
    },
  };
});
