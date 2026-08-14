/**
 * The navigation tree, shared by the build that emits it and the browser
 * that reads it — like `rebase-links.js`, plain JS so the build plugins can
 * import it unbuilt.
 *
 * A node is `{ name, group, children }`: one group in the navigation, with
 * the groups it collects (`collection: [...]` on its `docs()` usage)
 * beneath it. `group` is the group whose pages the node contributes, or
 * `null` for a group with no `src` of its own, which exists to collect the
 * others.
 *
 * @typedef {import('#types').NavNode} NavNode
 */

/**
 * The co-located pages' group (`app/templates`, `src/templates`). It comes
 * from no `docs()` usage, so it can never have options of its own, and its
 * pages live in the root URL space rather than under the group's name.
 */
export const HOME_GROUP = 'Home';

/**
 * Every group name in the node's subtree, its own first, depth first in
 * declaration order. The build uses it to know which groups a collection
 * has already placed; the browser, to know which groups an entry presents.
 *
 * @param {NavNode} node
 * @returns {string[]}
 */
export function groupNamesIn(node) {
  return [...(node.group === null ? [] : [node.group]), ...node.children.flatMap(groupNamesIn)];
}
