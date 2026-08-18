/**
 * A folder's index page is the one *named* `index`.
 *
 * Not a path test: `build()` strips `.gjs.md` / `.gts.md` off `path`, so two
 * of the three extensions arrive as `/foo/index`, and `/foo/api-index.md`
 * satisfies `endsWith('index.md')` without being an index at all.
 *
 * Both halves of the package decide this, and they have to agree. Sorting
 * hoists on it (`betterSort`, `applyPredestinedOrder`), and the nav hides a
 * page and links a folder heading on it (`isIndex`). They disagreed once,
 * which put a page in a folder that nothing linked to and nothing listed.
 *
 * This lives at the root of `src` because the build cannot import from
 * `src/browser`.
 *
 * @param {unknown} name a node's `name`, which is its basename through `stripExt`
 * @returns {boolean}
 */
export function isIndexName(name) {
  return name === 'index';
}
