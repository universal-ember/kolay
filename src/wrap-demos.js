import { visit } from 'unist-util-visit';

/**
 * Opt-in rehype plugin that wraps every live demo's placeholder element in a
 * component invocation, resolved from scope like any other component — bind
 * your own component to wrap every demo in it (via `topLevelScope` for the
 * in-browser `.md` compiler, via the docs() `scope` option for the
 * build-time `.gjs.md` compiler).
 *
 * Add it to the `rehypePlugins` of the pipeline whose demos should be
 * wrapped:
 * - `.md`: `setupKolay(this, { rehypePlugins: [wrapDemos], ... })`
 * - `.gjs.md`: `docs('...', { rehypePlugins: [wrapDemos], ... })`
 *
 * By default demos are wrapped in `<WrapDemo>` — without a binding of that
 * name, the passthrough default from 'kolay/wrap-demo' renders the demo
 * unchanged. To use a different scope binding, pass `componentName`
 * (a capitalized identifier, and then the binding must exist):
 * `[wrapDemos, { componentName: 'DemoFrame' }]`.
 *
 * This module is plain JS so both sides can use it: the browser re-exports
 * it from 'kolay/wrap-demo', the build from 'kolay/vite'.
 *
 * @param {{ componentName?: string }} [options]
 */
export function wrapDemos(options) {
  const componentName = options?.componentName ?? 'WrapDemo';

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
      if (node.value?.startsWith(`<${componentName}>`)) return;

      const id = node.value?.match(/id="([^"]+)"/)?.[1];

      if (!id || !ids.has(id)) return;

      node.value = `<${componentName}>${node.value}</${componentName}>`;
      // 'raw' nodes get reparsed as plain HTML (which would lowercase the
      // tag, e.g. to <wrapdemo>); 'glimmer_raw' passes through the rest of
      // the pipeline verbatim, like other component invocations.
      node.type = 'glimmer_raw';
    });
  };
}
