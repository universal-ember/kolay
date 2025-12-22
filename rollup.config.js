import { Addon } from '@embroider/addon-dev/rollup';
import fs from 'node:fs/promises';

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
    // the declarations plugin needs to detect Glint @ 2, and not do extension stripping on the imports
    // addon.declarations('declarations'),
    {
      name: 'Build Declarations',
      closeBundle: async () => {
        await execaCommand(`pnpm ember-tsc --declaration`, { stdio: 'inherit' });

        const deleteStyles2 = async () => {
          await fs.rm('dist/browser/typedoc/styles2.css');
          await fs.rm('dist/browser/typedoc/styles2.css.map');
        };

        const updateFile = async (file, search, replace) => {
          // https://github.com/embroider-build/embroider/issues/2461
          let contents = await fs.readFile(file);
          let fixed = contents.toString().replace(search, replace);

          await fs.writeFile(file, fixed);
        };

        await Promise.all([
          // updateFile('dist/browser/typedoc/index.js', `'./styles2.css'`, `'./styles.css'`),
          // This doesn't exist in source, but rollup.. just puts it here..
          // updateFile('dist/browser/index.js', `'./typedoc/styles2.css'`, `'./typedoc/styles.css'`),
          // deleteStyles2(),
        ]);
      },
    },
    addon.keepAssets(['**/*.css']),
    addon.clean(),
  ],
};
