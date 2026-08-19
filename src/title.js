/**
 * The author's `title`, then the first heading, then the cleaned name — which
 * normalizes separators but not case, so the capital comes from here.
 *
 * @param {{ title?: string, cleanedName?: string, name?: string }} node
 * @param {string[]} [headings]
 * @returns {string}
 */
export function titleFor(node, headings = []) {
  const fallback = node.cleanedName ?? node.name ?? '';

  return node.title ?? headings[0] ?? fallback.charAt(0).toUpperCase() + fallback.slice(1);
}

/**
 * Headings are shown as-is, so inline syntax is stripped: emphasis and code
 * marks, and the `[^label]` a footnote reference leaves behind.
 *
 * @param {string} source
 * @returns {string[]}
 */
export function headingsIn(source) {
  return [...source.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map((match) =>
    (match[1] ?? '')
      .replaceAll(/\[\^[^\]]+\]/g, '')
      .replaceAll(/[`*_]/g, '')
      .trim()
  );
}
