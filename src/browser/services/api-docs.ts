import { assert } from '@ember/debug';
import { buildWaiter } from '@ember/test-waiters';

import { createStore } from 'ember-primitives/store';

import { getKey } from './lazy-load.ts';

import type { LoadTypedoc } from '../../types.ts';

// Lets `settled()` (and so `visit`/`click` in tests) wait for typedoc JSON
// fetches, so tests never see partially-rendered API docs. A no-op in
// production builds.
const apiDocsWaiter = buildWaiter('kolay:api-docs-load');

export function typedocLoader(context: unknown) {
  const owner = getKey(context);

  return createStore(owner, DocsLoader);
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

    assert(
      `Could load API Docs for ${name}. 'loadApiDocs' did not now how to find ${name}. Was '${name}' including in the build config?`,
      loader
    );

    const token = apiDocsWaiter.beginAsync();
    const done = () => apiDocsWaiter.endAsync(token);
    const result = loader();

    result.then(done, done);

    return result;
  };
}
