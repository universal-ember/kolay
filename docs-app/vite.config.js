import { ember, extensions } from '@embroider/vite';
import { createRequire } from 'node:module';
import info from 'unplugin-info/vite';

import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
// import wasm from "vite-plugin-wasm";

const aliasPlugin = {
  name: 'env',
  setup(build) {
    // Intercept import paths called "env" so esbuild doesn't attempt
    // to map them to a file system location. Tag them with the "env-ns"
    // namespace to reserve them for this plugin.
    // build.onResolve({ filter: /^kolay.*:virtual$/ }, (args) => ({
    //   path: args.path,
    //   external: true,
    // }));

    build.onResolve({ filter: /ember-template-compiler/ }, () => ({
      path: require.resolve('ember-source/dist/ember-template-compiler'),
    }));

    build.onResolve({ filter: /content-tag$/ }, () => ({
      path: 'content-tag',
      external: true,
    }));
  },
};

const validator = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/validator/index.js`;
const tracking = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/tracking/index.js`;
const eUtil = `${process.cwd()}/node_modules/@embroider/util/addon/index.js`;
const cache = `${process.cwd()}/node_modules/ember-source/dist/packages/@glimmer/tracking/primitives/cache.js`;

export default defineConfig(({ mode }) => {
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
    // assetsInclude: ["**/*.wasm"],
    plugins: [
      info(),
      ember(),
      // wasm(),
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
      esbuildOptions: {
        target: 'esnext',
        // plugins: [aliasPlugin],
      },
    },
    // server: {
    //   mimeTypes: {
    //     "application/wasm": ["wasm"],
    //   },
    // },
  };
});
