/**
 * Path shapes kolay re-derives in several places. Consolidated because they
 * had drifted: two spellings of the glimmer-markdown extension, and a `.md`
 * strip that was case-sensitive in one place and not in three others.
 */

/**
 * Case-insensitive, since URLs conventionally are.
 *
 * @param {string} path
 * @returns {string}
 */
export function stripMarkdownExtension(path) {
  return path.replace(/\.md$/i, '');
}

/**
 * The extension the build drops, so live and plain pages share a URL shape.
 *
 * @param {string} path
 * @returns {string}
 */
export function stripGlimmerMarkdownExtension(path) {
  return path.replace(/\.g(j|t)s\.md$/i, '');
}

/**
 * At least one end is required: trimming neither is a no-op, and a call that
 * does nothing is a mistake rather than a choice.
 *
 * @param {string} path
 * @param {{ leading: true, trailing?: boolean } | { trailing: true, leading?: boolean }} ends
 * @returns {string}
 */
export function trimSlashes(path, { leading = false, trailing = false }) {
  let trimmed = path;

  if (leading) trimmed = trimmed.replace(/^\/+/, '');
  if (trailing) trimmed = trimmed.replace(/\/+$/, '');

  return trimmed;
}

/**
 * Two path segments joined by exactly one slash, however either side is
 * punctuated. Both sides are trimmed rather than one, so a caller never has
 * to know which of them carries the separator.
 *
 * @param {string} left
 * @param {string} right
 * @returns {string}
 */
export function concatenatePath(left, right) {
  return `${trimSlashes(left, { trailing: true })}/${trimSlashes(right, { leading: true })}`;
}

/**
 * URLs are conventionally case-insensitive; path/route matching in this
 * library follows that convention rather than treating paths as opaque,
 * case-sensitive strings.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function equalsIgnoreCase(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Whether two paths name the same page: paths with and without the
 * `.md` extension are the same page (both are visitable).
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function samePagePath(a, b) {
  return equalsIgnoreCase(stripMarkdownExtension(a), stripMarkdownExtension(b));
}
