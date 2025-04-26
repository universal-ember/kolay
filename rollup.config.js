import { Addon } from '@embroider/addon-dev/rollup';

import { babel } from '@rollup/plugin-babel';

const addon = new Addon({
  srcDir: 'src/browser',
  destDir: 'dist/browser',
});

export default {
  output: {
    ...addon.output(),
    preserveModules: true,
  },
  plugins: [
    addon.dependencies(),
    addon.publicEntrypoints([
      '*.js',
      'typedoc/index.js',
      'components/**/*.js',
      'services/kolay/{api-docs,compiler,docs,selected}.js',
      'typedoc/**/*.js',
    ]),
    babel({
      extensions: ['.js', '.gjs', '.gts', '.ts'],
      babelHelpers: 'bundled',
    }),

    addon.gjs(),
    addon.declarations('declarations'),
    addon.keepAssets(['**/*.css']),
    addon.clean(),
  ],
};
