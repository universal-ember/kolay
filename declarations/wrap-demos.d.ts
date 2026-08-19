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
export function wrapDemos(options: WrapDemosOptions): (tree: {
    type: string;
}, file?: {
    data?: {
        liveCode?: unknown;
    };
}) => void;
export type EachDemo = {
    /**
     * - 'always' (the default) wraps
     * every demo; 'opt-in' wraps only demos whose code fence has the `meta`
     * word.
     */
    behavior?: "always" | "opt-in" | undefined;
    /**
     * - the fence meta word that opts a demo in.
     * Required when behavior is 'opt-in'; unused when behavior is 'always'.
     */
    meta?: string | undefined;
    /**
     * - a fence meta word that skips wrapping for
     * that demo, for either behavior.
     */
    exclude?: string | undefined;
};
export type WrapDemosOptions = {
    /**
     * - which scope binding to wrap demos in
     * (a capitalized identifier). Runtime `.md` resolves it from
     * `setupKolay`'s `topLevelScope`; build-time `.gjs.md` from the docs()
     * usage's `scope`.
     */
    componentName: string;
    eachDemo?: EachDemo | undefined;
};
//# sourceMappingURL=wrap-demos.d.ts.map