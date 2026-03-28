import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';
import { renderEmberApp, assembleHTML } from 'vite-ember-ssr/server';

// Install minimal browser globals so that modules which access `window`,
// `document`, etc. at load time (e.g. ember-primitives/color-scheme) don't
// crash during SSR module evaluation. vite-ember-ssr's renderEmberApp will
// replace these with a fresh per-request Happy DOM window during rendering.
const ssrWindow = new Window({ url: 'http://localhost' });

const BROWSER_GLOBALS = [
  'window', 'document', 'navigator', 'location', 'history',
  'HTMLElement', 'Element', 'Node', 'Event', 'CustomEvent',
  'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame',
  'self', 'localStorage', 'sessionStorage', 'getComputedStyle',
  'matchMedia', 'IntersectionObserver', 'ResizeObserver',
];

for (const key of BROWSER_GLOBALS) {
  if (!(key in globalThis) && key in ssrWindow) {
    globalThis[key] = ssrWindow[key];
  }
}
if (!globalThis.window) {
  globalThis.window = ssrWindow;
}

// Vite plugin to stub out browser-only modules during SSR.
// ember-repl/repl-sdk use Web Workers at module init time which
// cannot work in Node.js. Since SSR doesn't need runtime compilation,
// we replace them with empty stubs.
function ssrBrowserStubs() {
  const STUB_MODULES = ['repl-sdk', 'ember-repl'];
  const STUB_ID_PREFIX = '\0ssr-stub:';

  return {
    name: 'ssr-browser-stubs',
    enforce: 'pre',
    resolveId(id) {
      for (const mod of STUB_MODULES) {
        if (id === mod || id.startsWith(mod + '/')) {
          return STUB_ID_PREFIX + id;
        }
      }
    },
    load(id) {
      if (id.startsWith(STUB_ID_PREFIX)) {
        // Provide named exports that kolay expects from ember-repl
        return `
          export function setupCompiler() {}
          export function compileGJS() { return { component: null, error: null }; }
          export function compileHBS() { return { component: null, error: null }; }
          export default {};
        `;
      }
    },
  };
}

// Vite plugin to patch the `kolay/setup` virtual module for SSR.
//
// Problem: kolay/setup captures `const secret = window[SECRET]` at module
// evaluation time. In SSR, vite-ember-ssr's `renderEmberApp` replaces `window`
// with a fresh Happy DOM window per request. The `setupKolay` function then
// adds the owner to the OLD window's secret object, but `getKey()` reads from
// the CURRENT (new) window. This causes an assertion failure.
//
// Fix: transform the virtual module so that `setupKolay` re-reads the secret
// from the current `window` on every call, rather than using a stale closure.
function ssrKolaySetupPatch() {
  return {
    name: 'ssr-kolay-setup-patch',
    transform(code, id) {
      // The kolay/setup virtual module has id starting with \0
      if (!id.includes('kolay/setup')) return;

      // Replace the module-level `secret` usage in setupKolay with
      // a fresh read from the current window at call time.
      const SECRET_SYMBOL = "Symbol.for('__kolay__secret__context__')";

      const patched = code.replace(
        /secret\.owners\.add\(owner\)/,
        `(() => {
          const _s = window[${SECRET_SYMBOL}] ||= {};
          _s.owners ||= new Set();
          _s.owners.add(owner);
        })()`
      );

      if (patched !== code) {
        return { code: patched, map: null };
      }
    },
  };
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const isDev = process.argv.includes('--dev');
const port = parseInt(process.env.PORT ?? '4200', 10);
const host = process.env.HOST ?? 'localhost';

const appRoot = __dirname;
const appDist = resolve(appRoot, 'dist');

async function start() {
  const app = Fastify({ logger: true });

  if (isDev) {
    await setupDevMode(app);
  } else {
    await setupProductionMode(app);
  }

  try {
    await app.listen({ port, host });
    console.log(
      `\n  SSR server running at http://${host}:${port} (${isDev ? 'development' : 'production'})\n`,
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// ─── Development Mode ────────────────────────────────────────────────

async function setupDevMode(app) {
  const { createServer: createViteServer } = await import('vite');

  process.chdir(appRoot);

  const vite = await createViteServer({
    root: appRoot,
    server: { middlewareMode: true },
    appType: 'custom',
    plugins: [ssrBrowserStubs(), ssrKolaySetupPatch()],
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
        'tracked-built-ins',
        /^@shikijs\//,
        /^shiki/,
        /^@babel\//,
        'babel-plugin-ember-template-compilation',
      ],
    },
  });

  await app.register(import('@fastify/middie'));
  app.use(vite.middlewares);

  app.get('*', async (request, reply) => {
    const url = request.url;

    if (isAssetRequest(url)) {
      return;
    }

    try {
      let template = await readFile(resolve(appRoot, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);

      const appModule = await vite.ssrLoadModule(resolve(appRoot, 'src/app-ssr.ts'));
      const { createSsrApp } = appModule;

      if (typeof createSsrApp !== 'function') {
        throw new Error(
          'Could not find `createSsrApp` export in src/app-ssr.ts. ' +
            'Make sure your Ember app exports a createSsrApp factory function.',
        );
      }

      const rendered = await renderEmberApp({ url, createApp: createSsrApp, shoebox: true });

      if (rendered.error) {
        app.log.error(rendered.error, 'SSR rendering error');
      }

      const html = assembleHTML(template, rendered);
      return reply.code(rendered.statusCode).type('text/html').send(html);
    } catch (e) {
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
      }
      app.log.error(e, 'SSR request failed');
      return reply.code(500).type('text/plain').send(e instanceof Error ? e.stack : String(e));
    }
  });
}

// ─── Production Mode ─────────────────────────────────────────────────

async function setupProductionMode(app) {
  await app.register(import('@fastify/compress'));

  await app.register(import('@fastify/static'), {
    root: resolve(appDist, 'client'),
    prefix: '/',
    wildcard: false,
    index: false,
    serveDotFiles: false,
  });

  const serverEntryPath = resolve(appDist, 'server/app-ssr.mjs');
  const appModule = await import(serverEntryPath);
  const { createSsrApp } = appModule;

  if (typeof createSsrApp !== 'function') {
    throw new Error(
      'Could not find `createSsrApp` export in dist/server/app-ssr.mjs. ' +
        'Make sure you ran the SSR build first.',
    );
  }

  const template = await readFile(resolve(appDist, 'client/index.html'), 'utf-8');

  app.get('*', async (request, reply) => {
    const url = request.url;

    if (isAssetRequest(url)) {
      return;
    }

    try {
      const rendered = await renderEmberApp({ url, createApp: createSsrApp, shoebox: true });

      if (rendered.error) {
        app.log.error(rendered.error, 'SSR rendering error');
      }

      const html = assembleHTML(template, rendered);
      return reply.code(rendered.statusCode).type('text/html').send(html);
    } catch (e) {
      app.log.error(e, 'SSR request failed');
      return reply.code(500).type('text/plain').send(e instanceof Error ? e.stack : String(e));
    }
  });
}

// ─── Utilities ───────────────────────────────────────────────────────

function isAssetRequest(url) {
  return /\.(js|mjs|css|ts|tsx|jsx|json|map|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp|avif|webm|mp4|wasm)(\?.*)?$/.test(
    url,
  );
}

start();
