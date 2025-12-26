import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';

export default defineConfig((/* { mode } */) => {
  return {
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
  };
});
