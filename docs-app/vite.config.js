import { classicEmberSupport, ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';
import rehypeShiki from '@shikijs/rehype'

export default defineConfig((/* { mode } */) => {
  return {
    plugins: [
      info(),
      kolay({
        nav: {
          root: [
            '/usage/index',
            '/usage/setup',
            '/usage/ordering-pages',
            '/usage/rendering-pages',
            '/usage/testing',
            '/plugins/helpers',
            '/plugins/kolay',
          ],
        },
        rehypePlugins: [[rehypeShiki, {
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: 'light-dark()',
        }]],
        groups: [
          /**
           * Instead of nav above -- let's make gjs.md discovery
           * automatic.
           * If no groups with gjs.md are found,
           * we will prepend this on our own.
           *
           * Which means opting out will be weird.
           * But that's probably fine.
           *
           * If a group is empty, it's not added to the manifest anyway.
           */
          {
            name: 'Home',
            static: './src/templates/**/*.gjs.md',
          },
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
