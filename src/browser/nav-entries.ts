import { groupNamesIn } from '../nav.js';

import type { Group, NavEntry, NavNode, PageTree } from '../types.ts';

/**
 * Turns `Manifest.nav` into what the navigation renders. Nothing here
 * touches routing: a collected group keeps its own pages, URLs, and mount.
 */

function landingGroup(node: NavNode): string {
  if (node.hasOwnPages) return node.name;

  return landingGroup(node.children[0]);
}

/**
 * A group's own tree, or — when it collects others — its own pages followed
 * by a section per collected group. The build already names each group's
 * tree after the group, so a section needs no renaming.
 */
export function treeFor(node: NavNode, groupFor: (name: string) => Group): PageTree {
  const own = node.hasOwnPages ? groupFor(node.name).tree : undefined;

  if (own && node.children.length === 0) return own;

  return {
    ...groupFor(landingGroup(node)).tree,
    path: node.name,
    name: node.name,
    pages: [...(own?.pages ?? []), ...node.children.map((child) => treeFor(child, groupFor))],
  };
}

/**
 * `hrefForGroup` is the docs service's `groupHrefFor`, which knows about
 * scoped mounts.
 */
export function navEntriesFor(
  nav: NavNode[],
  groupFor: (name: string) => Group,
  hrefForGroup: (groupName: string) => string
): NavEntry[] {
  return nav.map((node) => ({
    name: node.name,
    isCollection: node.children.length > 0,
    groups: groupNamesIn(node).map(groupFor),
    href: hrefForGroup(landingGroup(node)),
    tree: treeFor(node, groupFor),
  }));
}

/** The entry presenting this group: the one collecting it, or its own. */
export function navEntryFor(entries: NavEntry[], groupName: string): NavEntry | undefined {
  return entries.find((entry) => entry.groups.some((group) => group.name === groupName));
}

/**
 * By the entry's own name rather than a group it presents, which is the only
 * way to resolve a collection group with no `src`.
 *
 * Compared inline rather than with `equalsIgnoreCase`: this module's tests
 * run in node, and `browser/utils.ts` imports `@ember/debug`.
 */
export function navEntryNamed(entries: NavEntry[], name: string): NavEntry | undefined {
  return entries.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
}
