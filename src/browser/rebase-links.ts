import { visit } from 'unist-util-visit';

/**
 * Minimal structural type for the mdast nodes we touch, so the public
 * declarations don't require consumers to install @types/unist.
 */
interface MdastNode {
  type: string;
  url?: unknown;
}

/**
 * Rebase root-absolute link/image/definition URLs in authored markdown onto
 * the given prefix (typically the app's rootURL), so cross-doc links written
 * like `[icon library](/Docs/icons/icon-library.md)` and images like
 * `![logo](/Docs/images/logo.svg)` keep working when the app is served at a
 * non-root path (e.g. `/pr-previews/pr-1234/`).
 *
 * Kolay prepends this to its markdown pipeline automatically (see the docs
 * service `setup()`), which also guarantees it runs before any consumer
 * plugin that serializes paragraphs to raw HTML — rebasing has to happen
 * while the links are still mdast nodes. Operating on mdast also means
 * fenced code blocks (`code` nodes) are structurally unreachable, so
 * `href="/..."` in code samples is never rewritten.
 *
 * Exported for consumers with custom compile pipelines.
 */
export function rebaseAuthoredLinks(prefix: string) {
  return function remarkRebaseAuthoredLinks() {
    const base = prefix.replace(/\/$/, '');

    // Returning no transformer makes this plugin a no-op at the default
    // prefix of '/'
    if (!base) return;

    return (tree: MdastNode) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      visit(tree as any, ['link', 'image', 'definition'], (node: MdastNode) => {
        const url = node.url;

        if (typeof url !== 'string') return;

        // only root-absolute paths; '//host/...' is protocol-relative
        if (!url.startsWith('/') || url.startsWith('//')) return;

        // already prefixed (idempotent — safe if a consumer's own rebase
        // plugin or a pre-prefixed authored URL shows up)
        if (url === base || url.startsWith(base + '/')) return;

        node.url = base + url;
      });
    };
  };
}
