import { visit } from 'unist-util-visit';

/**
 * Rehype plugin that wraps every live demo's placeholder element in a
 * `<WrapDemo>` invocation, resolved from scope like any other component:
 * the default (from 'kolay/wrap-demo') renders the demo unchanged, and an
 * app wraps every demo in its own chrome by binding its own `WrapDemo` —
 * via `topLevelScope` for the in-browser `.md` compiler, via the docs()
 * `scope` option for the build-time `.gjs.md` compiler.
 *
 * The passthrough default is what lets this run unconditionally in both
 * pipelines.
 *
 * This module is plain JS so the node-side build plugins can import it
 * directly.
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
    visit(/** @type {any} */ (tree), 'raw', (node) => {
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
