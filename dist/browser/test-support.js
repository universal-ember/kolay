import { setupCompiler } from 'ember-repl/test-support';
import { d as docsManager, c as compilerOptions, P as PREPARE_DOCS } from './docs-CuwjwiTo.js';
import { f as forceFindOwner, s as setupSecret } from './modifier-Ctl1mPnl.js';

function setupKolay(hooks, config) {
  setupCompiler(hooks, compilerOptions(config ?? {}));
  hooks.beforeEach(async function () {
    setupSecret(this.owner);
    const docs = docsManager(this.owner);
    const [apiDocs, compiledDocs] = await Promise.all([import('kolay/api-docs:virtual'), import('kolay/compiled-docs:virtual')]);
    docs[PREPARE_DOCS](apiDocs, compiledDocs);
  });
}

/**
 * For changing which sub-context is loaded as the primary set of docs
 *
 * @param {unknown | Owner} context - can be the owner or an object that has had setOwner applied to it.
 */
function selectGroup(context, groupName = 'root') {
  forceFindOwner(context);
  const docs = docsManager();
  docs.selectGroup(groupName);
}

export { selectGroup, setupKolay };
//# sourceMappingURL=test-support.js.map
