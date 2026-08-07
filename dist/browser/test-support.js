import { setupCompiler } from 'ember-repl/test-support';
import { l as loadCompiledDocs } from './load-compiled-docs-C1Vk3_Aq.js';
import { j as forceFindOwner, d as docsManager, k as compilerOptions, P as PREPARE_DOCS } from './docs-Cjw58Nix.js';
import { s as setupSecret } from './modifier-BMAD6a8l.js';

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
