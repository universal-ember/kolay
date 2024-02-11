import { parse } from './parse.js';

/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 */
export async function reshape(paths, cwd) {
  let tree = await parse(paths, cwd);

  addInTheFirstPage(tree);

  let list = getList(tree);

  return {
    list,
    tree,
  };
}

/**
 * This requires that the pages are all sorted correctly, where index is always at the top
 *
 * @param {import('./types.ts').Page | Array<import('./types.ts').Page>} tree
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
 */
export function getList(tree) {
  let flatList = [];

  flatList.push(flatPages(tree));

  return flatList.flat();
}

/**
 * @param {import('./types.ts').Page[] | import('./types.ts').Page} tree
 * @returns {import('./types.ts').Tutorial[]}
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
