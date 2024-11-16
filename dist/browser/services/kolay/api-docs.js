import { assert } from '@ember/debug';
import Service from '@ember/service';

class DocsService extends Service {
  _packages = [];
  loadApiDocs = {};
  get packages() {
    assert(`packages was never set. Did you forget to import 'kolay/api-docs:virtual' and set it to 'apiDocs' when calling docs.setup()?`, this._packages);
    return this._packages;
  }
  load = name => {
    assert(`loadApiDocs was never set, did you forget to pass it do docs.setup?`, this.loadApiDocs);
    let loader = this.loadApiDocs[name];
    assert(`Could load API Docs for ${name}`, loader);
    return loader();
  };
}

export { DocsService as default };
//# sourceMappingURL=api-docs.js.map
