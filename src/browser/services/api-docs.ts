import { assert } from '@ember/debug';

import { createService } from 'ember-primitives/service';

let docs = new Set();
globalThis.docs = docs;

export function typedocLoader(context: object) {
  console.log('ctx', context);
  let result = createService(context, DocsLoader);

  docs.add(result);

  return result;
}

class DocsLoader {
  _packages: string[] = [];
  loadApiDocs: Record<string, () => ReturnType<typeof fetch>> = {};

  get packages() {
    assert(
      `packages was never set. Did you forget to import 'kolay/api-docs:virtual' and set it to 'apiDocs' when calling docs.setup()?`,
      this._packages
    );

    return this._packages;
  }

  load = (name: string) => {
    assert(`loadApiDocs was never set, did you forget to pass it do docs.setup?`, this.loadApiDocs);

    const loader = this.loadApiDocs[name];

    assert(`Could load API Docs for ${name}`, loader);

    return loader();
  };
}
