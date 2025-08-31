import { configsFrom, parse } from './parse.js';
import { sortTree } from './sort.js';

/**
 * @typedef {object} ReshapeOptions
 * @property {string[]} paths
 * @property {string} cwd path on disk that the paths are relative to - needed for looking up configs
 * @property {string | undefined} [prefix]
 *
 * @param {ReshapeOptions} options
 */
export async function reshape({ paths, cwd, prefix }) {
  let tree = await parse(paths, cwd);
  let configs = await configsFrom(paths, cwd);

  tree = sortTree(tree, configs);

  if (prefix) {
    tree = prefixPaths(tree, prefix);
  }

  addInTheFirstPage(tree);

  let list = getList(tree);

  return {
    list,
    tree,
  };
}

/**
 * @template {import('./types.ts').Node} Root
 * @param {Root} tree
 * @param {string} prefix
 */
export function prefixPaths(tree, prefix) {
  if (!('pages' in tree)) {
    if ('path' in tree) {
      tree.path = `${prefix}${tree.path}`;
    }

    return tree;
  }

  tree.pages.map((subTree) => prefixPaths(subTree, prefix));

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
    let paths = tree.map(addInTheFirstPage).flat();

    let path = paths[0];

    if (typeof path === 'string') {
      return path;
    }

    return;
  }

  if ('pages' in tree) {
    let path = addInTheFirstPage(tree.pages);

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
  let flatList = [];

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
