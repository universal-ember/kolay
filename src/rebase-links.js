import { visit } from 'unist-util-visit';

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
export function rebaseAuthoredLinks(prefix) {
  return function remarkRebaseAuthoredLinks() {
    // A static prefix of '/' can skip transforming entirely by returning no
    // transformer; getter prefixes resolve at transform time.
    if (typeof prefix === 'string' && !normalizePrefix(prefix)) return;

    /**
     * @param {{ type: string, url?: unknown, value?: unknown }} tree
     */
    return (tree) => {
      const base = normalizePrefix(typeof prefix === 'function' ? prefix() : prefix);

      if (!base) return;

      // `any` keeps @types/unist out of the public declarations
      visit(/** @type {any} */ (tree), ['link', 'image', 'definition', 'html'], (node) => {
        if (node.type === 'html') {
          if (typeof node.value === 'string') {
            node.value = rebaseHtml(node.value, base);
          }

          return;
        }

        if (typeof node.url === 'string') {
          node.url = rebaseUrl(node.url, base);
        }
      });
    };
  };
}

/**
 * @param {string} prefix
 */
function normalizePrefix(prefix) {
  return prefix.replace(/\/$/, '');
}

/**
 * @param {string} url
 * @param {string} base - normalized, no trailing slash
 */
function rebaseUrl(url, base) {
  // only root-absolute paths; '//host/...' is protocol-relative
  if (!url.startsWith('/') || url.startsWith('//')) return url;

  // already prefixed (idempotent — safe if a consumer's own rebase plugin or
  // a pre-prefixed authored URL shows up). Caveat: an authored path whose
  // first segment coincidentally equals the rootURL's segment is
  // indistinguishable from an already-rebased one and is left alone.
  if (url === base || url.startsWith(base + '/')) return url;

  return base + url;
}

/**
 * Rebase root-absolute `href`/`src` attribute values in a raw HTML string.
 *
 * @param {string} html
 * @param {string} base - normalized, no trailing slash
 */
function rebaseHtml(html, base) {
  return html.replace(
    /(\s(?:href|src)\s*=\s*)(["'])(\/[^"']*)\2/gi,
    (_match, attr, quote, url) => attr + quote + rebaseUrl(url, base) + quote
  );
}
