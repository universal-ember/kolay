import Route from '@ember/routing/route';

import { setupKolay } from 'kolay/setup';

import type { Manifest } from 'kolay';

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const manifest = await setupKolay(this, {
      resolve: {
        'ember-primitives': await import('ember-primitives'),
        kolay: await import('kolay'),
      },
    });

    return { manifest };
  }
}
