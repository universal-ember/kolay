/**
 * The path shapes kolay keeps re-deriving, in one place.
 *
 * These were spread across the build and the browser as inline regexes, and
 * they had drifted: two spellings of the glimmer-markdown extension, and a
 * `.md` strip that was case-sensitive in one place and not in three others.
 *
 * At the root of `src` because the build cannot import from `src/browser`.
 */

/**
 * A page URL with its `.md` removed. Both spellings address the same page, so
 * this is what path comparison normalizes away. Case-insensitive, since URLs
 * conventionally are.
 *
 * @param {string} path
 * @returns {string}
 */
export function stripMarkdownExtension(path) {
  return path.replace(/\.md$/i, '');
}

/**
 * A source path with `.gjs.md` / `.gts.md` removed, the extension the build
 * drops so a live-codefence page and a plain one share a URL shape.
 *
 * @param {string} path
 * @returns {string}
 */
export function stripGlimmerMarkdownExtension(path) {
  return path.replace(/\.g(j|t)s\.md$/i, '');
}

/**
 * @param {string} path
 * @returns {string}
 */
export function stripLeadingSlash(path) {
  return path.replace(/^\/+/, '');
}

/**
 * @param {string} path
 * @returns {string}
 */
export function stripTrailingSlash(path) {
  return path.replace(/\/+$/, '');
}
