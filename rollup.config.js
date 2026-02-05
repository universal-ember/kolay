import { Addon } from '@embroider/addon-dev/rollup';

import { babel } from '@rollup/plugin-babel';
import css from 'rollup-plugin-import-css';

const addon = new Addon({
  srcDir: 'src/browser',
  destDir: 'dist/browser',
});

export default {
  output: {
    ...addon.output(),
  },
  // The kolay.css import exists in source,
  // but does not resolve anywhere in source.
  // It is emitted via the css() plugin, which bundles
  // all CSS in the project into one file (not very much)
  external: [
    // All handled by the packager (e.g.: vite)
    './kolay.css',
    'kolay/api-docs:virtual',
    'kolay/compiled-docs:virtual',
  ],
  plugins: [
    addon.dependencies(),
    addon.publicEntrypoints([
      'index.js',
      'test-support.js',
      'typedoc/index.js',
      'components.js',
      'virtual/*.js',
    ]),
    babel({
      extensions: ['.js', '.gjs', '.gts', '.ts'],
      babelHelpers: 'bundled',
    }),

    addon.gjs(),
    addon.declarations('declarations', 'ember-tsc --declaration'),
    css({ include: ['**/*.css'], output: 'kolay.css', copyRelativeAssets: true }),
    addon.clean(),
  ],
};
