import { visit } from 'unist-util-visit';

/**
 * Kolay keeps every path it stores or compares — manifest paths, page-module
 * keys, authored links — in app-relative space, written as if the app were
 * served at `/`. The app's rootURL is applied only at the render edge, when a
 * physical URL is about to land in the DOM (an `href` or `src`). This module
 * is that edge; nothing else in kolay should need to know the rootURL.
 */

/**
 * Minimal structural type for the mdast nodes we touch, so the public
 * declarations don't require consumers to install @types/unist.
 */
interface MdastNode {
  type: string;
  url?: unknown;
}

/**
 * Prefix an app-relative path with the app's rootURL, producing the physical
 * URL to render into the DOM. A no-op at the default rootURL of `/`, and for
 * values that aren't root-absolute paths (external or relative URLs).
 */
export function applyRootURL(path: string, rootURL: string): string {
  if (rootURL === '/') return path;
  if (!path.startsWith('/') || path.startsWith('//')) return path;

  const base = rootURL.replace(/\/$/, '');

  // already physical — tolerate double application
  if (path === base || path.startsWith(base + '/')) return path;

  return base + path;
}

/**
 * Remark plugin that applies the rootURL to root-absolute link/image/
 * definition URLs in authored markdown (e.g. `[x](/Docs/a.md)`), so authored
 * content can be written as if the app were served at `/` and still work at
 * any deployment path.
 *
 * Kolay always prepends this to its markdown pipeline — it is not public API
 * and not configurable; authored content should never need to know where the
 * app is deployed. It must run while links are still mdast nodes (before
 * serialization); this also keeps code blocks untouched.
 */
export function rebaseAuthoredLinks(rootURL: string) {
  return function remarkRebaseAuthoredLinks() {
    // Returning no transformer makes this plugin a no-op at the default
    // rootURL of '/'
    if (rootURL === '/') return;

    return (tree: MdastNode) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      visit(tree as any, ['link', 'image', 'definition'], (node: MdastNode) => {
        if (typeof node.url !== 'string') return;

        node.url = applyRootURL(node.url, rootURL);
      });
    };
  };
}
