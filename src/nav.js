/**
 * The navigation tree, shared by the build that emits it and the browser
 * that reads it — like `rebase-links.js`, plain JS so the build plugins can
 * import it unbuilt.
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
 * Every group name in the node's subtree, its own first, depth first.
 *
 * @param {NavNode} node
 * @returns {string[]}
 */
export function groupNamesIn(node) {
  return [...(node.hasOwnPages ? [node.name] : []), ...node.children.flatMap(groupNamesIn)];
}
