import { prefetchPage } from 'kolay';
import { bootRehydrated, shouldRehydrate } from 'vite-ember-ssr/client';

import Application from './app.ts';
import config from './config.ts';

// During SSR rehydration, eagerly load the current URL's page module BEFORE
// booting Ember. Kolay's Selected service checks a path-keyed cache that
// prefetchPage populates; with the module cached, Glimmer's first render sees
// the resolved `<:success>` state synchronously and rehydration matches the
// SSR'd DOM. Without this, Selected would briefly render `<:pending>` for one
// microtask while the dynamic import resolves — flashing the loading state
// over the prerendered content.
//
// Skip on plain-boot pages: there's nothing in the DOM to mismatch against.
if (shouldRehydrate()) {
  try {
    await prefetchPage(window.location.pathname);
  } catch {
    // Page not in manifest, network failure, etc. — fall through to normal
    // boot. The async Selected loader will handle it (possibly with a flash).
  }
}

// When the page was server-rendered, bootRehydrated() creates the app with
// autoboot: false and calls app.visit(url, { _renderMode: 'rehydrate' }) so
// Glimmer attaches to the existing DOM in place instead of replacing it.
// When the page was NOT server-rendered (e.g. `pnpm start:vite` without the
// SSR server), it falls back to a normal Application.create(config.APP).
bootRehydrated(Application, config);
