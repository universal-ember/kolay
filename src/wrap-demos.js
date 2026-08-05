import { visit } from 'unist-util-visit';

/**
 * Opt-in rehype plugin that wraps every live demo's placeholder element in a
 * `<WrapDemo>` invocation, resolved from scope like any other component —
 * bind your own `WrapDemo` to wrap every demo in it (via `topLevelScope` for
 * the in-browser `.md` compiler, via the docs() `scope` option for the
 * build-time `.gjs.md` compiler). Without a binding, the passthrough default
 * from 'kolay/wrap-demo' renders the demo unchanged.
 *
 * Add it to the `rehypePlugins` of the pipeline whose demos should be
 * wrapped:
 * - `.md`: `setupKolay(this, { rehypePlugins: [rehypeWrapDemos], ... })`
 * - `.gjs.md`: `docs('...', { rehypePlugins: [rehypeWrapDemos], ... })`
 *
 * This module is plain JS so both sides can use it: the browser re-exports
 * it from 'kolay/wrap-demo', the build from 'kolay/vite'.
 */
export function rehypeWrapDemos() {
  /**
   * @param {{ type: string }} tree
   * @param {{ data?: { liveCode?: unknown } }} [file]
   */
  return (tree, file) => {
    const liveCode = file?.data?.liveCode;

    if (!Array.isArray(liveCode) || liveCode.length === 0) return;

    const ids = new Set();

    for (const block of liveCode) {
      const demoId = block?.id ?? block?.placeholderId;

      if (typeof demoId === 'string') ids.add(demoId);
    }

    if (ids.size === 0) return;

    // The placeholders are raw HTML nodes (`<div id="<demo id>" ...>`) by the
    // time rehype runs — same matching as the build's component injection.
    // `any` keeps @types/unist out of the public declarations
    visit(/** @type {any} */ (tree), ['raw', 'glimmer_raw'], (node) => {
      // listed twice in the pipeline — wrap once
      if (node.value?.startsWith('<WrapDemo>')) return;

      const id = node.value?.match(/id="([^"]+)"/)?.[1];

      if (!id || !ids.has(id)) return;

      node.value = `<WrapDemo>${node.value}</WrapDemo>`;
      // 'raw' nodes get reparsed as plain HTML (which would lowercase the
      // tag to <wrapdemo>); 'glimmer_raw' passes through the rest of the
      // pipeline verbatim, like other component invocations.
      node.type = 'glimmer_raw';
    });
  };
}
