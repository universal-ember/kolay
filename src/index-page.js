/**
 * A folder's index page is the one *named* `index`.
 *
 * Both halves of the package decide this and have to agree: sorting hoists on
 * it, and the nav hides a page and links a section heading on it. At the root
 * of `src` because the build cannot import from `src/browser`.
 *
 * @param {unknown} name a node's `name`, which is its basename through `stripExt`
 * @returns {boolean}
 */
export function isIndexName(name) {
  return name === 'index';
}
