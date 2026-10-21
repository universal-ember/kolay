import { setupCompiler } from 'ember-repl/test-support';
import { l as loadCompiledDocs } from './load-compiled-docs-rjVGMYB8.js';
import { k as forceFindOwner, d as docsManager, l as compilerOptions, P as PREPARE_DOCS } from './docs-CGM7i59Z.js';
import { s as setupSecret } from './modifier-CFCGogpN.js';

function setupKolay(hooks, config) {
  setupCompiler(hooks, compilerOptions(config ?? {}));
  hooks.beforeEach(async function () {
    setupSecret(this.owner);
    const docs = docsManager(this.owner);
    const [apiDocs, meta] = await Promise.all([import('kolay/api-docs:virtual'), import('kolay/compiled-docs:virtual')]);
    const compiledDocs = await loadCompiledDocs(meta);
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
