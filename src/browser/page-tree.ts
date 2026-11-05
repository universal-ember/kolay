/**
 * Queries over a built page tree. Free of framework imports so they can be
 * unit tested, and because they are pure functions over the manifest shape.
 */

import { equalsIgnoreCase } from '../paths.js';

import type { Page, PageTree } from '../types.ts';

export function isPageTree(x: Page | PageTree): x is PageTree {
  return 'pages' in x;
}

/**
 * The sub-tree at an app-relative path. A group's own tree matches its root.
 */
export function findPageTree(root: PageTree, appRelativePath: string): PageTree | undefined {
  if (equalsIgnoreCase(root.appRelativePath, appRelativePath)) return root;

  for (const child of root.pages) {
    if (!isPageTree(child)) continue;

    const match = findPageTree(child, appRelativePath);

    if (match) return match;
  }

  return undefined;
}

/**
 * A folder's index page: the page named `index` when the folder has one, and
 * the folder's first page otherwise. `undefined` only for a folder with no
 * pages anywhere beneath it.
 *
 * This is where the folder's URL redirects to, and what `<PageNav />` yields
 * as `index`. It reads `tree.first` rather than re-deriving the answer, so
 * the three cannot drift apart.
 *
 * The fallback can descend: a folder whose first child is itself a folder
 * answers with that child's index page.
 */
export function getIndexPage(tree: PageTree): Page | undefined {
  return tree.first === undefined ? undefined : findPage(tree, tree.first);
}

/** `tree.first` is a base-prefixed path, which is what `Page.path` is. */
function findPage(tree: PageTree, path: string): Page | undefined {
  for (const child of tree.pages) {
    if (isPageTree(child)) {
      const nested = findPage(child, path);

      if (nested) return nested;

      continue;
    }

    if (child.path === path) return child;
  }

  return undefined;
}

/**
 * Whether a folder's heading already says what this page's link would say.
 *
 * A nav renders a folder as a heading linking to its index page, then lists
 * the folder's pages. Listing the page the heading links to, under the words
 * the heading already used, says it twice — so skip that one.
 *
 * Both halves are required. The page has to be the one the heading links to,
 * or a page that merely happens to share the folder's title would be dropped
 * from a list that is the only place it appears. And the titles have to
 * match, because a folder titled by its `meta.json` says something its index
 * page does not, and then both are worth showing.
 */
export function isRedundantWithHeading(folder: Page | PageTree, page: Page | PageTree): boolean {
  if (isPageTree(page) || !isPageTree(folder)) return false;
  if (page !== getIndexPage(folder)) return false;

  return Boolean(folder.title) && page.title === folder.title;
}
