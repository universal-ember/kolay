/**
 * Tutorials (and groups) are all 123-name
 * This is so that we can sort them manually on the file system.
 * However, it's human understanding that 10 comes after 9 and before 11,
 * instead of the file system default of after 1 and before 2.
 *
 * This sort function fixes the sort to be intuitive.
 * If some file systems correctly sort files starting with numbers,
 * then this is a no-op.
 *
 * @param {string} [property]
 */
export function betterSort(property) {
  /**
   * @param {any} a
   * @param {any} b
   */
  return (a, b) => {
    let aFull = property ? a[property] : a;
    let bFull = property ? b[property] : b;

    if ('path' in a && 'path' in b && typeof a.path === 'string' && typeof b.path === 'string') {
      if (a.path.endsWith('index.md')) return -1;
      if (b.path.endsWith('index.md')) return 1;
    }

    let [aNumStr, ...aRest] = aFull.split('-');
    let [bNumStr, ...bRest] = bFull.split('-');

    // Throw things starting with x at the end
    if (aNumStr === 'x') return 1;
    if (bNumStr === 'x') return 1;

    let aNum = Number(aNumStr);
    let bNum = Number(bNumStr);

    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;

    let aName = aRest.join('-');
    let bName = bRest.join('-');

    return aName.localeCompare(bName);
  };
}

/**
 * @template Item
 * @param {Item[]} list
 * @param {string[]} order
 * @param {(item: Item) => any} [ find ]
 * @returns {Item[]}
 */
export function applyPredestinedOrder(list, order, find = (x) => x) {
  let result = [];

  let remaining = list;

  for (let i = 0; i < Math.max(list.length, order.length); i++) {
    let current = order[i];

    if (!current) break;

    let foundIndex = remaining.findIndex((x) => find(x) === current);

    if (foundIndex < 0) continue;

    // remove
    let [found] = remaining.splice(foundIndex, 1);

    if (!found) continue;

    result.push(found);
  }

  result.push(...remaining);

  return result;
}

/**
 * @template {import('./types.ts').Page} Root
 * @param {Root} tree
 * @param {{ path: string, config?: { order: string[] }}[]} configs
 * @param {string[]} [ parents ]
 */
export function sortTree(tree, configs, parents = []) {
  if (!('pages' in tree)) {
    return tree;
  }

  tree.pages.map((subTree) => sortTree(subTree, configs, [...parents, tree.name]));

  if (configs.length > 0) {
    let subPath = `${[...parents, tree.name].join('/')}`;
    let config = configs.filter(Boolean).find((config) => config.path.startsWith(subPath))?.config;

    if (!config?.order) {
      return tree;
    }

    // Should the name always avoid the extension?
    let replacementPages = applyPredestinedOrder(tree.pages, config.order, (page) =>
      page.name.replace(/\.\w+$/, '')
    );

    tree.pages = replacementPages;
  }

  return tree;
}
