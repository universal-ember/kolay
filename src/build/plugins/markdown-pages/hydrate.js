import { join } from 'node:path';

import { parse } from './parse.js';
import { sortTree } from './sort.js';

/**
 * @typedef {object} ReshapeOptions
 * @property {string[]} paths
 * @property {string[]} configs
 * @property {string} cwd path on disk that the paths are relative to - needed for looking up configs
 * @property {string} prefix app-relative group prefix, e.g. '/Documentation' (or '/' for the unnamed group)
 * @property {string} base the app's base URL / rootURL, e.g. '/my-github-project/' (or '/')
 *
 * @param {ReshapeOptions} options
 */
export async function reshape({ paths, configs, cwd, prefix, base }) {
  let tree = await parse(paths, cwd);

  tree = sortTree(tree, configs);
  tree = addPaths(tree, prefix, base);

  addInTheFirstPage(tree);

  const list = getList(tree);

  return {
    list,
    tree,
  };
}

/**
 * Every item gets two path spaces, computed once here at build time:
 * - `appRelativePath`: as if the app were deployed at '/' — the space
 *   `router.currentURL` and `transitionTo` operate in
 * - `path`: prefixed with the base URL — the space hrefs and the
 *   compiled-docs module map operate in
 *
 * @template {import('#types').Node} Root
 * @param {Root} tree
 * @param {string} prefix app-relative group prefix ('/Documentation' or '/')
 * @param {string} base the app's base URL / rootURL
 * @param {string | null} [parentAppRelative] the containing collection's appRelativePath (null at the root)
 */
export function addPaths(tree, prefix, base, parentAppRelative = null) {
  if (!('pages' in tree)) {
    // a page: `tree.path` is rooted at the group, e.g. '/sub-folder/x.md'
    tree.appRelativePath = join(prefix, tree.path);
    tree.path = join(base, tree.appRelativePath);

    return tree;
  }

  // a collection: `tree.path` stays a bare segment (e.g. 'sub-folder');
  // appRelativePath locates it in URL space
  tree.appRelativePath = parentAppRelative === null ? prefix : join(parentAppRelative, tree.path);

  tree.pages.map((subTree) => addPaths(subTree, prefix, base, tree.appRelativePath));

  return tree;
}

/**
 * This requires that the pages are all sorted correctly, where index is always at the top
 *
 * @param {import('./types.ts').Node | Array<import('./types.ts').Node>} tree
 *
 * @return {string | undefined}
 */
export function addInTheFirstPage(tree) {
  if (Array.isArray(tree)) {
    const paths = tree.map(addInTheFirstPage).flat();

    const path = paths[0];

    if (typeof path === 'string') {
      return path;
    }

    return;
  }

  if ('pages' in tree) {
    const path = addInTheFirstPage(tree.pages);

    if (typeof path === 'string') {
      tree.first = path;

      return path;
    }

    return;
  }

  if ('path' in tree && typeof tree.path === 'string') {
    return tree.path;
  }

  return tree.path;
}

/**
 * @param {import('./types.ts').Collection} tree
 * @return {import('./types.ts').Page[]}
 */
export function getList(tree) {
  const flatList = [];

  flatList.push(flatPages(tree));

  return flatList.flat();
}

/**
 * @param {import('./types.ts').Node[] | import('./types.ts').Node} tree
 * @returns {import('./types.ts').Page[]}
 */
function flatPages(tree) {
  if (Array.isArray(tree)) {
    return tree.map((subTree) => flatPages(subTree)).flat();
  }

  if ('pages' in tree) {
    return flatPages(tree.pages).flat();
  }

  return [tree];
}
