import Route from '@ember/routing/route';
import { setupKolay } from 'kolay/setup';

export default class ApplicationRoute extends Route {
  async model() {
    const manifest = await setupKolay(this, {
      apiDocs: await import('kolay/api-docs:virtual'),
      manifest: await import('kolay/manifest:virtual'),
      resolve: {
        'ember-primitives': await import('ember-primitives'),
        kolay: await import('kolay'),
      },
    });

    return { manifest };
  }
}
