/**
 * A docs source's meta, from `virtual:kolay/docs/<groupName>`:
 * derived from the repository root's package.json, mixed with the
 * content of a `meta.jsonc` at the root of the source (user keys win).
 */

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
      groups: modules.map(mod => mod.manifest)
    },
    pages: Object.assign({}, ...modules.map(mod => mod.pages))
  };
}

export { loadCompiledDocs as l };
//# sourceMappingURL=load-compiled-docs-C1Vk3_Aq.js.map
