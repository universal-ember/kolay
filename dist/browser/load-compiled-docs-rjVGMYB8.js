/**
 * What each `virtual:kolay/docs/<groupName>` module provides.
 */

/**
 * What 'kolay/compiled-docs:virtual' provides: the metamanifest — which
 * groups exist, and how to load each group's docs module.
 */

/**
 * Loads every group's docs module — in parallel, for site speed — and
 * assembles the combined manifest + page-loader map the docs service
 * consumes. `setupKolay` does this behind the scenes.
 */
async function loadCompiledDocs(meta) {
  const modules = await Promise.all(meta.groups.map(group => group.load()));
  return {
    manifest: {
      base: meta.base,
      redirects: meta.redirects,
      groups: modules.map(mod => ({
        ...mod.manifest,
        meta: mod.meta
      }))
    },
    pages: Object.assign({}, ...modules.map(mod => mod.pages)),
    loadSearchData: async () => {
      const searchModules = await Promise.all(meta.groups.map(group => group.load().then(mod => mod.search())));
      return searchModules.flat();
    }
  };
}

export { loadCompiledDocs as l };
//# sourceMappingURL=load-compiled-docs-rjVGMYB8.js.map
