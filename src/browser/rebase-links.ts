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
 * Remark plugin that rebases root-absolute link/image/definition URLs in
 * authored markdown (e.g. `[x](/Docs/a.md)`) onto the given prefix, so they
 * keep working when the app is served at a non-root rootURL.
 *
 * Kolay prepends this to its markdown pipeline automatically. It must run
 * while links are still mdast nodes; this also keeps code blocks untouched.
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
