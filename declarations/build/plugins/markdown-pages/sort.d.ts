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
export function betterSort(property?: string): (a: any, b: any) => any;
/**
 * @template Item
 * @param {Item[]} list
 * @param {string[]} order
 * @param {(item: Item) => any} [ find ]
 * @throws {Error}
 * @returns {Item[]}
 */
export function applyPredestinedOrder<Item>(list: Item[], order: string[], find?: (item: Item) => any): Item[];
/**
 * @template {import('./types.ts').Node} Root
 * @param {Root} tree
 * @param {{ path: string, config?: { order: string[] }}[]} configs
 * @param {string[]} [ parents ]
 */
export function sortTree<Root extends any>(tree: Root, configs: {
    path: string;
    config?: {
        order: string[];
    };
}[], parents?: string[]): Root;
//# sourceMappingURL=sort.d.ts.map