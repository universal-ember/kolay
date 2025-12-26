import { setupCompiler } from 'ember-repl/test-support';

import { compilerOptions, docsManager, LOAD_MANIFEST, PREPARE_DOCS } from './services/docs.ts';

import type { setupTest } from 'ember-qunit';
import type { setupKolay as setup } from 'kolay/setup';
import { setOwner } from '@ember/owner';

type Options = Parameters<typeof setup>[1];
type NestedHooks = Parameters<typeof setupTest>[0];

export function setupKolay(hooks: NestedHooks, config?: Options): void {
  setupCompiler(hooks, compilerOptions(config ?? {}));

  hooks.beforeEach(async function () {
    setOwner(document.body, this.owner);

    const docs = docsManager();

    const [apiDocs, manifest] = await Promise.all([
      import('kolay/api-docs:virtual'),
      import('kolay/manifest:virtual'),
    ]);

    docs[PREPARE_DOCS](manifest, apiDocs);

    await docs[LOAD_MANIFEST];
  });
}

/**
 * For changing which sub-context is loaded as the primary set of docs
 */
export function selectGroup(groupName = 'root'): void {
  const docs = docsManager();

  docs.selectGroup(groupName);
}
