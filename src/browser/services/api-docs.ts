import { assert } from '@ember/debug';

import { createStore } from 'ember-primitives/store';

import type { LoadTypedoc } from '../../types.ts';

export function typedocLoader() {
  return createStore(document.body, DocsLoader);
}

class DocsLoader {
  _packages: string[] = [];
  loadApiDocs: LoadTypedoc = {};

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
