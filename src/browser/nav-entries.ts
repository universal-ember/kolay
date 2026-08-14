import { groupNamesIn } from '../nav.js';

import type { Group, NavEntry, NavNode, PageTree } from '../types.ts';

/**
 * A group may collect other groups — `docs('data', { collection: [...] })` —
 * and the tree that describes rides the metamanifest onto `Manifest.nav`.
 * This module turns that tree into the navigation's shape: one entry per
 * top-level group, each with the page tree to render for it.
 *
 * Nothing here touches routing. A collected group keeps its own pages,
 * URLs, and scoped mount; collecting is a navigation-level merge only.
 */

/**
 * The group whose landing page an entry for this node should link to: its
 * own, or — for a group with no pages of its own — the first group it
 * collects, however deep. Always resolves: a group with no pages of its own
 * collects at least one group, which `NavCollection` states.
 */
function landingGroup(node: NavNode): string {
  if (node.hasOwnPages) return node.name;

  return landingGroup(node.children[0]);
}

/**
 * The page tree for a nav node: the group's own tree when it collects
 * nothing — or its own pages (when it has any) followed by a section per
 * group it collects, nesting for a group that collects others.
 *
 * The tree is located where the entry links: at the landing group's pages,
 * whose `first` is the page a visitor arrives on. A group's own tree is
 * already named after the group (the build names it), so a section needs no
 * renaming — `PageNav` renders it like any other folder in a tree.
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
 * The top-level navigation: one entry per node of `Manifest.nav`, which is
 * one per group that no other group collects. A group that collects others
 * stands in for everything beneath it, and links where its own pages are
 * (or, with no pages of its own, where the first group it collects is).
 *
 * `hrefForGroup` supplies a group's URL — the docs service passes its
 * `groupHrefFor`, which knows about scoped mounts.
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

/**
 * The nav entry the named group is presented by: the entry of the group
 * that collects it (however deep), or its own. `undefined` when the group
 * isn't in the navigation.
 */
export function navEntryFor(entries: NavEntry[], groupName: string): NavEntry | undefined {
  return entries.find((entry) => entry.groups.some((group) => group.name === groupName));
}

/**
 * The entry with this name — its own name, rather than a group it presents.
 * A collection group with no `src` of its own is only ever named here, so
 * this is the only way to resolve it. Case-insensitive, like group names.
 *
 * The comparison is inline rather than `equalsIgnoreCase` from
 * `browser/utils.ts`: this module's unit tests run in node, and that file
 * imports `@ember/debug`.
 */
export function navEntryNamed(entries: NavEntry[], name: string): NavEntry | undefined {
  return entries.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
}
