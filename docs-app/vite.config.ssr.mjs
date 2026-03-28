import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import rehypeShiki from '@shikijs/rehype';
import { kolay } from 'kolay/vite';
import { emberSsr } from 'vite-ember-ssr/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    plugins: [
      ember(),
      kolay({
        groups: [
          {
            name: 'Runtime',
            src: import.meta.resolve('../docs', import.meta.url),
          },
        ],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
              defaultColor: 'light-dark()',
            },
          ],
        ],
        packages: ['kolay', 'ember-primitives', 'ember-resources'],
        scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        import { Shadowed } from 'ember-primitives/components/shadowed';
        import { InViewport } from 'ember-primitives/viewport';
        `,
      }),
      babel({
        babelHelpers: 'runtime',
        extensions,
      }),
      ...emberSsr({ appName: 'docs-app' }),
    ],
    build: {
      ssr: 'src/app-ssr.ts',
      outDir: 'dist/server',
      target: 'node22',
      sourcemap: true,
      minify: false,
    },
    ssr: {
      noExternal: [
        /^@ember\//,
        /^@glimmer\//,
        /^@embroider\//,
        /^ember-/,
        'decorator-transforms',
        'kolay',
        /^nvp\./,
        /^reactiveweb/,
        'change-case',
      ],
    },
    optimizeDeps: {
      exclude: ['kolay'],
    },
  };
});
