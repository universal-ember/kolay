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
 * A path without the slashes you ask it to trim. Each end is opt-in, because
 * callers almost always have exactly one in the way: a manifest path keeps
 * its leading slash, a config `from` key never has one.
 *
 * @param {string} path
 * At least one end is required: trimming neither is a no-op, and a call that
 * does nothing is a mistake rather than a choice.
 *
 * @param {{ leading: true, trailing?: boolean } | { trailing: true, leading?: boolean }} ends
 * @returns {string}
 */
export function trimSlashes(path, { leading = false, trailing = false }) {
  let trimmed = path;

  if (leading) trimmed = trimmed.replace(/^\/+/, '');
  if (trailing) trimmed = trimmed.replace(/\/+$/, '');

  return trimmed;
}
