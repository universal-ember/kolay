import Route from '@ember/routing/route';

import { setupKolay } from 'kolay/setup';

import type { Manifest } from 'kolay';

/**
 * Pared-down ApplicationRoute used only by the SSG build (see ./app-ssr.ts).
 *
 * The client ApplicationRoute (./application.ts) hands setupKolay a `modules`
 * map populated with `() => import('babel-plugin-ember-template-compilation')`
 * and similar — runtime-compiler dependencies needed when kolay falls back
 * to compiling raw `.md` pages in the browser. Vite static-analyzes those
 * import() calls and bundles their full transitive graph (content-tag's
 * `.cjs`, babel-import-util's CJS surface, etc.) into whatever build it sees
 * them in. During SSG that graph trips vite-ember-ssr's CJS shim against
 * rolldown's stricter parser.
 *
 * SSG renders only pre-compiled `.gjs.md` pages — the runtime compiler is
 * never invoked. So this SSR-only route skips the `modules` argument and
 * the highlighter setup, calling setupKolay with just the manifest plumbing
 * it needs to render the navigation chrome.
 */
export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const manifest = await setupKolay(this);

    return { manifest };
  }
}
