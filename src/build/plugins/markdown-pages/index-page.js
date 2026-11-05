/**
 * Whether a node's name marks it as the page a folder is built around.
 *
 * Sorting hoists on this, and `addTitles` takes a folder's title from such a
 * page. The two have to agree, and read the name rather than the path: the
 * build strips `.gjs.md` and `.gts.md` off paths before sorting runs, so a
 * path test misses those and matches anything merely *ending* in `index`.
 *
 * Build-only. The browser asks a different question — a folder's index page
 * falls back to its first page, which `getIndexPage` reads off `tree.first`.
 *
 * @param {unknown} name a node's `name`, which is its basename through `stripExt`
 * @returns {boolean}
 */
export function isIndexName(name) {
  return name === 'index';
}
