import './virtual-types.d.ts';

import { assert } from '@ember/debug';
import Service from '@ember/service';

export default class DocsService extends Service {
  // packages = packageNames;
  packages: string[] = [];
  loadApiDocs: Record<string, () => ReturnType<typeof fetch>> = {};

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
