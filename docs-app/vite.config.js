import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';

export default defineConfig((/* { mode } */) => {
  return {
    plugins: [
      info(),
      kolay({
        src: 'public/docs',
        groups: [
          {
            name: 'Runtime',
            src: './node_modules/kolay/docs',
          },
        ],
        packages: ['kolay', 'ember-primitives', 'ember-resources'],
        scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        import { Shadowed } from 'ember-primitives/components/shadowed';
        import { InViewport } from 'ember-primitives/viewport';
        `
      }),
      classicEmberSupport(),
      ember(),
      babel({
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
  };
});
