import { assert } from '@ember/debug';
import Service from '@ember/service';

export default class DocsService extends Service {
  _packages: string[] = [];
  loadApiDocs: Record<string, () => ReturnType<typeof fetch>> = {};

  get packages() {
    assert(
      `packages was never set. Did you forget to import 'kolay/api-docs:virtual' and set it to 'apiDocs' when calling docs.setup()?`,
      this._packages,
    );

    return this._packages;
  }

  load = (name: string) => {
    assert(
      `loadApiDocs was never set, did you forget to pass it do docs.setup?`,
      this.loadApiDocs,
    );

    let loader = this.loadApiDocs[name];

    assert(`Could load API Docs for ${name}`, loader);

    return loader();
  };
}
