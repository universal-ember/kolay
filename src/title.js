/**
 * How anything in kolay gets a display title, in one place.
 *
 * Precedence: the author's frontmatter `title`, then the page's first
 * heading — a page's title is usually its first `#` — then the cleaned
 * name, which normalizes separators but not case, so the capital comes
 * from here.
 *
 * Pages and the folders that hold them resolve the same way: a folder with
 * its own `index` page is titled by that page, because it is the folder's
 * page.
 *
 * @param {{ title?: string, cleanedName?: string, name?: string }} node
 * @param {string[]} [headings] the node's headings, first one winning
 * @returns {string}
 */
export function titleFor(node, headings = []) {
  const fallback = node.cleanedName ?? node.name ?? '';

  return node.title ?? headings[0] ?? fallback.charAt(0).toUpperCase() + fallback.slice(1);
}

/**
 * The headings in a markdown source, in document order. Headings are shown
 * as-is, so inline syntax is stripped: emphasis and code marks, and the
 * `[^label]` a footnote reference leaves behind.
 *
 * @param {string} source
 * @returns {string[]}
 */
export function headingsIn(source) {
  return [...source.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map(([, heading]) =>
    heading
      .replaceAll(/\[\^[^\]]+\]/g, '')
      .replaceAll(/[`*_]/g, '')
      .trim()
  );
}
