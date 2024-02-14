import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service('kolay/docs') docs;

  async model() {
    // TODO?: Should setup also fetch the manifest?
    //        then we just await setup here?
    this.docs.setup({
      // TODO: can be determined by createManifest plugin
      //       (if it emits a virtual module)
      manifest: '/docs/manifest.json',
    });

    const request = await fetch(this.docs.manifestLocation);
    const json = await request.json();

    return { manifest: json };
  }
}
