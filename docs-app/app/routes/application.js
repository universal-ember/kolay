import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service('kolay/docs') docs;

  async model() {
    // TODO?: Should setup also fetch the manifest?
    //        then we just await setup here?
    this.docs.setup({
      apiDocs: await import('virtual/kolay/api-docs'),
      // TODO: can be determined by createManifest plugin
      //       (if it emits a virtual module)
      manifest: '/docs/manifest.json',

      resolve: {
        'ember-primitives': await import('ember-primitives'),
        kolay: await import('kolay'),
      },
    });

    const request = await fetch(this.docs.manifestLocation);
    const json = await request.json();

    return { manifest: json };
  }
}
