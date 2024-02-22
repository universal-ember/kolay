import './virtual-types.d.ts';

import { assert } from '@ember/debug';
import Service from '@ember/service';

// import { loadApiDocs,packageNames } from 'virtual:kolay/api-docs';

export default class DocsService extends Service {
  // packages = packageNames;

  // importing this module _must_ be an await-import, or otherwise
  // embroider tries to tell us we didn't declare the 'virtual' dependency
  // in our package.json.
  // Is embroider running too early?
  setup = async () => {
    if ((window as any).loadApiDocs) return;

    let { loadApiDocs } = await import('virtual:kolay/api-docs');

    (window as any).loadApiDocs = loadApiDocs;
  };

  load = (name: string) => {
    let loader = (window as any).loadApiDocs[name];

    assert(`Could load API Docs for ${name}`, loader);

    return loader();
  };
}
