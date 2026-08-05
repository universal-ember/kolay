import { visit } from 'unist-util-visit';

/**
 * Rehype plugin that wraps every live demo's placeholder element in a
 * `<WrapDemo>` invocation, so a component the app provided via
 * `setupKolay({ wrapDemo })` renders around every demo.
 *
 * `<WrapDemo>` (from 'kolay/wrap-demo') resolves the app's wrapper at render
 * time — with none configured it renders the demo unchanged. That's what lets
 * this run unconditionally in both markdown pipelines (the in-browser
 * compiler for `.md` and the build-time compiler for `.gjs.md`): whether a
 * wrapper exists is only known at runtime.
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
