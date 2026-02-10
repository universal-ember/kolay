/**
 * @param {unknown[]} arr
 * @returns {unknown[]}
 */
function uniq(arr) {
  return Array.from(new Set(arr));
}

/**
 * @param {string} path
 * @returns {string}
 */
function findPathForJsonc(path) {
  return path.replace(/\/meta\.jsonc?$/, '');
}

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
    const aFull = property ? a[property] : a;
    const bFull = property ? b[property] : b;

    if ('path' in a && 'path' in b && typeof a.path === 'string' && typeof b.path === 'string') {
      if (a.path.endsWith('index.md')) return -1;
      if (a.path.endsWith('index.gjs.md')) return -1;
      if (b.path.endsWith('index.md')) return 1;
      if (b.path.endsWith('index.gjs.md')) return 1;
    }

    const [aNumStr, ...aRest] = aFull.split('-');
    const [bNumStr, ...bRest] = bFull.split('-');

    // Throw things starting with x at the end
    if (aNumStr === 'x') return 1;
    if (bNumStr === 'x') return -1;

    const aNum = Number(aNumStr);
    const bNum = Number(bNumStr);

    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;

    const aName = aRest.join('-');
    const bName = bRest.join('-');

    return aName.localeCompare(bName);
  };
}

/**
 * @template Item
 * @param {Item[]} list
 * @param {string[]} order
 * @param {(item: Item) => any} [ find ]
 * @throws {Error}
 * @returns {Item[]}
 */
export function applyPredestinedOrder(list, order, find = (x) => x) {
  const indexPage = list.find((x) => find(x) === 'index');
  const result = indexPage ? [indexPage] : [];

  list = list.filter((a) => a !== indexPage);

  const remaining = [...list];

  if (uniq(order).length !== order.length)
    throw new Error(`Order configuration specified duplicate pages:
Unique: ${JSON.stringify(uniq(order))}
Order: ${JSON.stringify(order)}
Actual: ${JSON.stringify(list.map(find))}`);

  if (order.length !== list.length)
    throw new Error(`Order configuration specified different number of arguments than available pages:
Order: ${JSON.stringify(order)}
Actual: ${JSON.stringify(list.map(find))}

When specifying order, all pages (listed under "Actual") must be specified.`);

  for (let i = 0; i < order.length; i++) {
    const current = order[i];

    if (!current) throw new Error(`Order configuration found an empty string at index ${i}`);

    const foundIndex = remaining.findIndex((x) => find(x) === current);

    if (foundIndex < 0)
      throw new Error(
        `Order configuration specified "${current}" but it was not found in the list. Pages are ${JSON.stringify(list.map(find))}`
      );

    // remove
    const [found] = remaining.splice(foundIndex, 1);

    if (!found) continue;

    result.push(found);
  }

  if (remaining.length > 0) {
    throw new Error(
      `Order configuration did not specify all pages. Remaining pages are ${JSON.stringify(remaining.map(find))}`
    );
  }

  return result;
}

/**
 * @template {import('./types.ts').Node} Root
 * @param {Root} tree
 * @param {{ path: string, config?: { order: string[] }}[]} configs
 * @param {string[]} [ parents ]
 */
export function sortTree(tree, configs, parents = []) {
  if (!('pages' in tree)) {
    return tree;
  }

  tree.pages.map((subTree) => sortTree(subTree, configs, [...parents, tree.path]));

  if (configs.length > 0) {
    const subPath = `${[...parents, tree.path].join('/')}`.replace(/^root\//, '');
    const config = configs
      .filter(Boolean)
      .find((config) => findPathForJsonc(config.path) === subPath)?.config;

    if (!config?.order) {
      return tree;
    }

    // Should the name always avoid the extension?
    try {
      const replacementPages = applyPredestinedOrder(tree.pages, config.order, (page) => page.name);

      tree.pages = replacementPages;
    } catch (error) {
      throw new Error(`Error while sorting tree at ${subPath}.\n${error}`);
    }
  }

  return tree;
}
