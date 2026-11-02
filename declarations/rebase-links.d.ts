/**
 * Remark plugin that rebases root-absolute URLs in authored markdown onto the
 * given prefix, so they keep working when the app is served at a non-root
 * rootURL. Handles link/image/definition mdast nodes as well as `href`/`src`
 * attributes in raw inline HTML.
 *
 * Kolay prepends this to both of its markdown pipelines automatically (the
 * in-browser compiler for `.md` and the build-time compiler for `.gjs.md`).
 * It must run while links are still mdast nodes; this also keeps code blocks
 * untouched. Exported for consumers with custom compile pipelines.
 *
 * This module is plain JS so the node-side build plugins can import it
 * directly; the browser re-exports it from `kolay`.
 *
 * @param {string | (() => string)} prefix - the app's rootURL, with or
 *   without a trailing slash. The build plugins pass a getter because the
 *   base URL is only known after their compiler is constructed.
 */
export function rebaseAuthoredLinks(prefix: string | (() => string)): () => ((tree: {
    type: string;
    url?: unknown;
    value?: unknown;
}) => void) | undefined;
//# sourceMappingURL=rebase-links.d.ts.map