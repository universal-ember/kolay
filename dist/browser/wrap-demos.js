import { visit } from 'unist-util-visit';

/**
 * @typedef {object} EachDemo
 * @property {'always' | 'opt-in'} [behavior] - 'always' (the default) wraps
 *   every demo; 'opt-in' wraps only demos whose code fence has the `meta`
 *   word.
 * @property {string} [meta] - the fence meta word that opts a demo in.
 *   Required when behavior is 'opt-in'; unused when behavior is 'always'.
 * @property {string} [exclude] - a fence meta word that skips wrapping for
 *   that demo, for either behavior.
 *
 * @typedef {object} WrapDemosOptions
 * @property {string} componentName - which scope binding to wrap demos in
 *   (a capitalized identifier). Runtime `.md` resolves it from
 *   `setupKolay`'s `topLevelScope`; build-time `.gjs.md` from the docs()
 *   usage's `scope`.
 * @property {EachDemo} [eachDemo]
 */

/**
 * Opt-in rehype plugin that wraps every live demo's placeholder element in a
 * component invocation, resolved from scope like any other component.
 *
 * Add it — with the scope binding to wrap demos in — to the `rehypePlugins`
 * of the pipeline whose demos should be wrapped:
 * - `.md`: `setupKolay(this, { rehypePlugins: [[wrapDemos, { componentName: 'Shadowed' }]] })`
 * - `.gjs.md`: `docs('...', { rehypePlugins: [[wrapDemos, { componentName: 'Shadowed' }]] })`
 *
 * `eachDemo` controls which demos are wrapped, via words in the code fence
 * meta (e.g. ```` ```gjs live shadow ````):
 * `{ behavior: 'always' | 'opt-in', meta: 'shadow', exclude: 'no-shadow' }`.
 *
 * This module is plain JS, so its 'kolay/wrap-demos' entrypoint works from
 * both the browser and build config.
 *
 * @param {WrapDemosOptions} options
 */
function wrapDemos(options) {
  const {
    componentName,
    eachDemo = {}
  } = options ?? {};
  if (typeof componentName !== 'string' || !/^[A-Z][a-zA-Z0-9_]*$/.test(componentName)) {
    throw new Error(`wrapDemos requires a componentName: which scope binding to wrap demos in ` + `(a capitalized identifier, e.g. { componentName: 'Shadowed' }). ` + `Got: ${JSON.stringify(componentName)}`);
  }
  const {
    behavior = 'always',
    meta,
    exclude
  } = eachDemo;
  if (behavior !== 'always' && behavior !== 'opt-in') {
    throw new Error(`wrapDemos' eachDemo.behavior must be 'always' or 'opt-in'. Got: ${JSON.stringify(behavior)}`);
  }
  if (behavior === 'opt-in' && !meta) {
    throw new Error(`wrapDemos' eachDemo.behavior 'opt-in' requires eachDemo.meta: ` + `the fence meta word that opts a demo in (e.g. { meta: 'shadow' })`);
  }

  /**
   * @param {unknown} blockMeta
   */
  function shouldWrap(blockMeta) {
    // Word-matching, not substring: 'no-shadow' contains 'shadow'
    const words = typeof blockMeta === 'string' ? blockMeta.split(/\s+/) : [];
    if (exclude && words.includes(exclude)) return false;
    if (behavior === 'opt-in') return words.includes(/** @type {string} */meta);
    return true;
  }

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
      if (typeof demoId !== 'string') continue;
      if (!shouldWrap(block?.meta)) continue;
      ids.add(demoId);
    }
    if (ids.size === 0) return;

    // The placeholders are raw HTML nodes (`<div id="<demo id>" ...>`) by the
    // time rehype runs — same matching as the build's component injection.
    // `any` keeps @types/unist out of the public declarations
    visit(/** @type {any} */tree, ['raw', 'glimmer_raw'], node => {
      // listed twice in the pipeline — wrap once
      if (node.value?.startsWith(`<${componentName}>`)) return;
      const id = node.value?.match(/id="([^"]+)"/)?.[1];
      if (!id || !ids.has(id)) return;
      node.value = `<${componentName}>${node.value}</${componentName}>`;
      // 'raw' nodes get reparsed as plain HTML (which would lowercase the
      // tag); 'glimmer_raw' passes through the rest of the pipeline
      // verbatim, like other component invocations.
      node.type = 'glimmer_raw';
    });
  };
}

export { wrapDemos };
//# sourceMappingURL=wrap-demos.js.map
