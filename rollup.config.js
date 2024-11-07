import { Addon } from '@embroider/addon-dev/rollup';

import { babel } from '@rollup/plugin-babel';
import { execaCommand } from 'execa';
import { fixBadDeclarationOutput } from 'fix-bad-declaration-output';

const addon = new Addon({
  srcDir: 'src/browser',
  destDir: 'dist/browser',
});

export default {
  // This provides defaults that work well alongside `publicEntrypoints` below.
  // You can augment this if you need to.
  output: {
    ...addon.output(),
    // preserveModules: true,
    hoistTransitiveImports: false,
  },
  plugins: [
    // These are the modules that users should be able to import from your
    // addon. Anything not listed here may get optimized away.
    // By default all your JavaScript modules (**/*.js) will be importable.
    // But you are encouraged to tweak this to only cover the modules that make
    // up your addon's public API. Also make sure your package.json#exports
    // is aligned to the config here.
    // See https://github.com/embroider-build/embroider/blob/main/docs/v2-faq.md#how-can-i-define-the-public-exports-of-my-addon
    addon.publicEntrypoints([
      '*.js',
      'typedoc/index.js',
      'components/**/*.js',
      'services/kolay/{api-docs,compiler,docs,selected}.js',
      'typedoc/**/*.js',
    ]),

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.
    addon.dependencies(),

    // This babel config should *not* apply presets or compile away ES modules.
    // It exists only to provide development niceties for you, like automatic
    // template colocation.
    //
    // By default, this will load the actual babel config from the file
    // babel.config.json.
    babel({
      extensions: ['.js', '.gjs', '.gts', '.ts'],
      babelHelpers: 'bundled',
    }),

    // Ensure that .gjs files are properly integrated as Javascript
    addon.gjs(),

    addon.keepAssets(['**/*.css']),
    // Remove leftover build artifacts when starting a new build.
    addon.clean(),

    {
      name: 'Build Declarations',
      closeBundle: async () => {
        /**
         * Generate the types (these include /// <reference types="ember-source/types"
         * but our consumers may not be using those, or have a new enough ember-source that provides them.
         */
        console.log('Building types');
        await execaCommand(`pnpm glint --declaration`, { stdio: 'inherit' });
        /**
         * https://github.com/microsoft/TypeScript/issues/56571#
         * README: https://github.com/NullVoxPopuli/fix-bad-declaration-output
         */
        console.log('Fixing types');

        await fixBadDeclarationOutput(
          ['./declarations/browser/**/*', '!./declarations/browser/virtual/**/*'],
          [['TypeScript#56571', { types: 'all' }]]
        );
        console.log('⚠️ Dangerously (but neededly) fixed bad declaration output from typescript');
      },
    },
  ],
};
