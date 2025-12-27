import { setupCompiler } from 'ember-repl/test-support';

import { compilerOptions, docsManager, LOAD_MANIFEST, PREPARE_DOCS } from './services/docs.ts';
import { forceFindOwner } from './utils.ts';

import type { setupTest } from 'ember-qunit';
import type { setupKolay as setup } from 'kolay/setup';

type Options = Parameters<typeof setup>[1];
type NestedHooks = Parameters<typeof setupTest>[0];

export function setupKolay(hooks: NestedHooks, config?: Options): void {
  setupCompiler(hooks, compilerOptions(config ?? {}));

  hooks.beforeEach(async function () {
    const docs = docsManager(this.owner);

    const [apiDocs, manifest] = await Promise.all([
      import('kolay/api-docs:virtual'),
      import('kolay/manifest:virtual'),
    ]);

    docs[PREPARE_DOCS](manifest, apiDocs);

    await docs[LOAD_MANIFEST]();
  });
}

/**
 * For changing which sub-context is loaded as the primary set of docs
 *
 * @param {unknown | Owner} context - can be the owner or an object that has had setOwner applied to it.
 */
export function selectGroup(context: unknown, groupName = 'root'): void {
  const owner = forceFindOwner(context);
  const docs = docsManager(owner);

  docs.selectGroup(groupName);
}
