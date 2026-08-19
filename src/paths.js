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
 * A path without its leading and/or trailing slashes. Both ends by default,
 * so a bare call does what the name says; narrow it when only one end is in
 * the way — `appRelativePath` keeps its leading slash, config `from` keys do
 * not have one.
 *
 * @param {string} path
 * @param {{ leading?: boolean, trailing?: boolean }} [ends]
 * @returns {string}
 */
export function trimSlashes(path, { leading = true, trailing = true } = {}) {
  let trimmed = path;

  if (leading) trimmed = trimmed.replace(/^\/+/, '');
  if (trailing) trimmed = trimmed.replace(/\/+$/, '');

  return trimmed;
}
