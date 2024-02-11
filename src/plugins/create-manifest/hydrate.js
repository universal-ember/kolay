import { parse } from './parse.js';


/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 */
export async function reshape(paths, cwd) {
    let tree = await parse(paths, cwd);
    let list = getList(tree);

    return {
      list,
      tree,
    };
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
        return tree.map(subTree => flatPages(subTree)).flat();
    }

    if ('pages' in tree) {
        return flatPages(tree.pages).flat();
    }

    return [tree];
  }