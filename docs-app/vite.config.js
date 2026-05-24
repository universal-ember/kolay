import { ember, extensions } from '@embroider/vite';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { babel } from '@rollup/plugin-babel';
import rehypeShiki from '@shikijs/rehype';
import { kolay } from 'kolay/vite';
import info from 'unplugin-info/vite';
import { defineConfig } from 'vite';
import { emberSsg } from 'vite-ember-ssr/vite-plugin';
import inspect from 'vite-plugin-inspect';

/**
 * Mirror kolay's setup-plugin URL conventions to produce the SSG route list.
 *
 * Files in `docs-app/src/templates/` belong to the implicit "Home" group and
 * map directly to a URL path (e.g. `usage/setup.gjs.md` → `usage/setup`).
 * Files in `../docs/` belong to the configured `Runtime` group (see the
 * `kolay({ groups })` call below) and are prefixed with the group name
 * (e.g. `util/page.gjs.md` → `Runtime/util/page`).
 *
 * `emberSsg` requires routes without a leading slash. `'index'` is the
 * special-cased landing page name (produces `<outDir>/index.html` and
 * captures whatever the router redirects to from `/`).
 */
async function enumerateDocsRoutes() {
  const routes = new Set(['index']);
  const stripExt = (entry) => entry.replace(/\.(?:gjs|gts)\.md$|\.md$/, '');

  const homeRoot = fileURLToPath(new URL('./src/templates/', import.meta.url));

  for await (const entry of glob('**/*.{gjs.md,gts.md,md}', { cwd: homeRoot })) {
    routes.add(stripExt(entry));
  }

  const runtimeRoot = fileURLToPath(new URL('../docs/', import.meta.url));

  for await (const entry of glob('**/*.{gjs.md,gts.md,md}', { cwd: runtimeRoot })) {
    routes.add(`Runtime/${stripExt(entry)}`);
  }

  return [...routes];
}

export default defineConfig(async ({ mode, isSsrBuild }) => {
  const isDev = mode === 'development';
  const ssgRoutes = await enumerateDocsRoutes();

  return {
    plugins: [
      inspect(),
      info(),
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
      // Prerender every documented route to static HTML at build time. Without
      // emberSsr in the same config, emberSsg outputs straight to `outDir`
      // (`dist/client` here, kept stable for vercel.json's outputDirectory).
      // ssrEntry defaults to 'app/app-ssr.ts' upstream; this app uses 'src/'.
      // Skipped in dev mode (build:tests) to avoid running the full SSR
      // render pipeline on every test build.
      ...(isDev
        ? []
        : [
            emberSsg({
              routes: ssgRoutes,
              ssrEntry: 'src/app-ssr.ts',
              outDir: 'dist/client',
            }),
          ]),
    ],
    build: {
      // Keep the output directory stable across modes. emberSsg also writes
      // here in non-dev builds; testem.cjs and vercel.json both point at it.
      outDir: 'dist/client',
      reportCompressedSize: false,
      ...(isSsrBuild || isDev ? { minify: false } : { minify: 'oxc' }),
      // SSR bundling: skip rolldownOptions code-splitting groups (irrelevant
      // for a single-bundle SSR output and rolldown's SSR pipeline rejects
      // unknown groups).
      ...(isSsrBuild
        ? {}
        : {
            rolldownOptions: {
              output: {
                codeSplitting: {
                  groups: [
                    {
                      name: 'unified',
                      test: /hast|mdast|remark|rehype|unified|vfile/,
                    },
                  ],
                },
              },
            },
          }),
    },
    optimizeDeps: {
      // Because we use dep injection
      exclude: ['kolay'],
    },
  };
});
