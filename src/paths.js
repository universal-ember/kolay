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
