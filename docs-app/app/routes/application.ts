import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type { DocsService, Manifest } from 'kolay';

export default class ApplicationRoute extends Route {
  @service('kolay/docs') declare docs: DocsService;

  async model(): Promise<{ manifest: Manifest }> {
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
