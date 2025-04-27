import { Addon } from '@embroider/addon-dev/rollup';

import { babel } from '@rollup/plugin-babel';
import { execaCommand } from 'execa';

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
    // the declarations plugin needs to detect Glint @ 2, and not do extension stripping on the imports
    // addon.declarations('declarations'),
    {
      name: 'Build Declarations',
      closeBundle: async () => await execaCommand(`pnpm glint`, { stdio: 'inherit' }),
    },
    addon.keepAssets(['**/*.css']),
    addon.clean(),
  ],
};
