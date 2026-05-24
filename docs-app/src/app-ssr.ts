import Application from '@ember/application';
import { settled } from '@ember/test-helpers';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import PageTitleService from 'ember-page-title/services/page-title';
import Resolver from 'ember-resolver';

import config from './config.ts';
import Router from './router.ts';
import SsrApplicationRoute from './routes/application-ssr.ts';

// SSR-only resolver registry. Built fresh here (not imported from registry.ts)
// so we can EXCLUDE `./routes/application.ts` from the SSR module graph —
// that route eagerly registers `import('babel-plugin-ember-template-compilation')`
// and other heavy dynamic-import chunks for kolay's runtime markdown compiler.
// Vite static-analyzes those import() calls and bundles the whole transitive
// graph (content-tag's `.cjs`, babel-import-util's CJS surface, etc.) into
// whichever build sees them; in the SSG/SSR pipeline that graph trips
// vite-ember-ssr's CJS shim against rolldown's stricter parser. SSG never
// invokes the runtime compiler, so we swap in the lean SsrApplicationRoute.
const appName = 'docs-app';

function formatAsResolverEntries(imports: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(imports).map(([k, v]) => [
      k
        .replace(/\.gjs\.md$/, '')
        .replace(/\.g?(j|t)s$/, '')
        .replace(/^\.\//, `${appName}/`),
      v,
    ])
  );
}

const ssrRegistry: Record<string, unknown> = {
  [`${appName}/router`]: Router,
  [`${appName}/services/page-title`]: PageTitleService,
  [`${appName}/routes/application`]: { default: SsrApplicationRoute },
  ...formatAsResolverEntries(import.meta.glob('./templates/**/*.{gjs,gts,js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./services/**/*.{js,ts}', { eager: true })),
  // Pull in everything under routes/ EXCEPT the client application route.
  ...formatAsResolverEntries(
    import.meta.glob(['./routes/**/*.{js,ts}', '!./routes/application.{js,ts}'], {
      eager: true,
    })
  ),
};

class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(ssrRegistry);
}

// Patch fetch for the two cases SSG hits that Node's built-in fetch can't
// handle:
//
//   1. `fetch('/<dest>/<pkg>.json')` from kolay's api-docs runtime — Node has
//      no HTTP server running at HappyDOM's `http://localhost/` so the fetch
//      rejects and `getPromiseState` writes "Promise rejected while waiting
//      to resolve" into the prerendered HTML. Read the JSON from disk.
//
//   2. `fetch(new URL('content_tag_bg.wasm', import.meta.url))` from content-tag
//      / wasm-bindgen init — that resolves to a `file://` URL, and undici
//      returns `Error: not implemented... yet...` for the `file:` scheme.
//      Read the wasm bytes from disk with the right content-type.
const LOCAL_ASSET_PREFIXES = ['/docs/', '/api-docs/'];
let fetchPatched = false;

function patchFetchForLocalAssets() {
  if (fetchPatched) return;
  fetchPatched = true;

  const realFetch = globalThis.fetch;
  const clientDir = resolve(process.cwd(), 'dist/client');

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    try {
      // file:// — undici can't fetch these, but we can read them. Vite
      // emits hashed asset URLs (e.g. `content_tag_bg-CrL58-hw.wasm`)
      // only into the client build dir, not the SSG temp build, so look
      // up by base name in dist/client/assets/ as a fallback.
      if (url.startsWith('file://')) {
        const { fileURLToPath } = await import('node:url');
        const path = await import('node:path');
        const filePath = fileURLToPath(url);
        let body: Buffer | null = null;

        try {
          body = await readFile(filePath);
        } catch {
          // Try the client assets dir, matching by base-name prefix
          // (Vite adds a hash before the extension).
          const { readdir } = await import('node:fs/promises');
          const base = path.basename(filePath, path.extname(filePath));
          const ext = path.extname(filePath);
          const clientAssets = path.resolve(process.cwd(), 'dist/client/assets');
          const candidates = await readdir(clientAssets);
          const match = candidates.find((f) => f.startsWith(base) && f.endsWith(ext));

          if (match) body = await readFile(path.join(clientAssets, match));
        }

        if (body) {
          const contentType = filePath.endsWith('.wasm')
            ? 'application/wasm'
            : filePath.endsWith('.json')
              ? 'application/json'
              : 'application/octet-stream';

          return new Response(new Uint8Array(body), {
            status: 200,
            headers: { 'content-type': contentType },
          });
        }
      }

      // http://localhost/{docs,api-docs}/... — emitted by the client build
      // into dist/client, read straight from disk.
      const parsed = new URL(url, 'http://localhost/');
      const isLocal = LOCAL_ASSET_PREFIXES.some((p) => parsed.pathname.startsWith(p));

      if (parsed.host === 'localhost' && isLocal) {
        const file = resolve(clientDir, parsed.pathname.slice(1));
        const body = await readFile(file);

        return new Response(body, {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
    } catch {
      // Fall through to real fetch on any parse / read failure; getPromiseState
      // will then capture whatever real fetch returns (or its rejection).
    }

    return realFetch(input, init);
  }) as typeof fetch;
}

export function createSsrApp() {
  const app = App.create({ ...config.APP, autoboot: false });

  // Patched after limber's app-ssr (apps/repl/app/app-ssr.ts): bake
  // `await settled()` into `app.visit` so the visit promise resolves only
  // when Ember's run loop, pending timers, and `@ember/test-waiters`
  // (reactiveweb's getPromiseState for the .gjs.md page loader, etc.)
  // have drained. Without this we'd rely on vite-ember-ssr's worker
  // calling `awaitSettled(10_000)` after visit, which fires the 10s
  // timeout on cold-start renders and captures the DOM mid-page-load.
  const originalVisit = app.visit.bind(app);

  Object.assign(app, {
    visit: async (...args: Parameters<typeof originalVisit>) => {
      // Install the fetch patch lazily, on first visit. vite-ember-ssr's
      // worker overwrites globalThis.fetch with its own (shoebox) wrapper
      // AFTER our createSsrApp returns, so patching there gets clobbered.
      // By the time visit runs the worker setup is complete, and our
      // wrapper sits in front of theirs.
      patchFetchForLocalAssets();

      const instance = await originalVisit(...args);

      // Settle in a loop, not just once. Kolay's `<Page>` first renders the
      // page Prose only after the Selected loader resolves; that Prose may
      // contain `<APIDocs>` / `<Load>` which kick off ANOTHER `fetch()` and
      // register a fresh `waitForPromise` waiter for it. If we only awaited
      // settled() once, we'd return before that second waiter had a chance
      // to be created, capturing the DOM mid-typedoc-fetch with a "Loading
      // api docs..." placeholder. Re-checking with a microtask between calls
      // catches newly-scheduled async work, and we cap iterations so a
      // genuinely-stuck render still terminates.
      for (let i = 0; i < 10; i++) {
        await settled();
        await new Promise((r) => setTimeout(r, 0));
        // After the microtask drain, if nothing new ran, settled() returns
        // immediately on the next iteration and we exit on the next round.
      }

      return instance;
    },
  });

  return app;
}
