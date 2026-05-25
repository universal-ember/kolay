import { prefetchPage, prewarmTypedocCaches } from 'kolay';
import { bootRehydrated, shouldRehydrate } from 'vite-ember-ssr/client';

import Application from './app.ts';
import config from './config.ts';

// During SSR rehydration, eagerly load the current URL's page module AND
// every configured typedoc package's JSON BEFORE booting Ember:
//
//   - `prefetchPage` populates Kolay's path-keyed page module cache so
//     `Selected.loader` returns a synchronous `{ resolved }` state on its
//     first access. Without it, Selected would briefly render `<:pending>`
//     for one microtask while the dynamic import resolves, flashing the
//     loading state over the SSG'd prose.
//
//   - `prewarmTypedocCaches` fetches + deserializes every `apiDocs({ packages })`
//     entry so the first render of `<APIDocs>` / `<Load>` has a synchronous
//     `request.resolved` and the SSG'd `<section>` of typedoc declarations
//     stays mounted through rehydration.
//
// Skip on plain-boot pages: there's nothing in the DOM to mismatch against.
if (shouldRehydrate()) {
  try {
    await Promise.all([prefetchPage(window.location.pathname), prewarmTypedocCaches()]);
  } catch {
    // Page not in manifest, network failure, etc. — fall through to normal
    // boot. The async Selected / Load resources will handle it (possibly
    // with a brief flash).
  }
}

// When the page was server-rendered, bootRehydrated() creates the app with
// autoboot: false and calls app.visit(url, { _renderMode: 'rehydrate' }) so
// Glimmer attaches to the existing DOM in place instead of replacing it.
// When the page was NOT server-rendered (e.g. `pnpm start:vite` without the
// SSR server), it falls back to a normal Application.create(config.APP).
bootRehydrated(Application, config);
