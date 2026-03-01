/**
 * @typedef {object} ReshapeOptions
 * @property {string[]} paths
 * @property {string[]} configs
 * @property {string} cwd path on disk that the paths are relative to - needed for looking up configs
 * @property {string | undefined} [prefix]
 *
 * @param {ReshapeOptions} options
 */
export function reshape({ paths, configs, cwd, prefix }: ReshapeOptions): Promise<{
    list: any[];
    tree: any;
}>;
/**
 * @template {import('./types.ts').Node} Root
 * @param {Root} tree
 * @param {string} prefix
 */
export function prefixPaths<Root extends any>(tree: Root, prefix: string): Root;
/**
 * This requires that the pages are all sorted correctly, where index is always at the top
 *
 * @param {import('./types.ts').Node | Array<import('./types.ts').Node>} tree
 *
 * @return {string | undefined}
 */
export function addInTheFirstPage(tree: any | Array<any>): string | undefined;
/**
 * @param {import('./types.ts').Collection} tree
 * @return {import('./types.ts').Page[]}
 */
export function getList(tree: any): any[];
export type ReshapeOptions = {
    paths: string[];
    configs: string[];
    /**
     * path on disk that the paths are relative to - needed for looking up configs
     */
    cwd: string;
    prefix?: string | undefined;
};
//# sourceMappingURL=hydrate.d.ts.map