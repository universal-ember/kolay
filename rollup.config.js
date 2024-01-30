import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default {
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(['browser/index.js']),
    addon.dependencies(),
    babel({
      extensions: ['.js', '.gjs'],
      babelHelpers: 'bundled',
    }),
    addon.gjs(),
    addon.clean(),
  ],
};
