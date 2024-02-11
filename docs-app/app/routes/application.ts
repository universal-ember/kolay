import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  async model() {
    const request = await fetch('/docs/manifest.json');
    const json = await request.json();

    return { manifest: json };
  }
}
