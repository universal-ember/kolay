import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service('kolay/docs') docs;

  async model() {
    await this.docs.setup({
      apiDocs: await import('kolay/api-docs:virtual'),
      manifest: await import('kolay/manifest:virtual'),
      resolve: {
        'ember-primitives': await import('ember-primitives'),
        kolay: await import('kolay'),
      },
    });

    return { manifest: this.docs.manifest };
  }
}
