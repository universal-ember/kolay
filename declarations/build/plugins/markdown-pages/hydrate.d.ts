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
export function reshape({ paths, configs, cwd, prefix, base }: ReshapeOptions): Promise<{
    list: any[];
    tree: any;
}>;
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
export function addPaths<Root extends import("#types").Node>(tree: Root, prefix: string, base: string, parentAppRelative?: string | null): Root;
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
    /**
     * app-relative group prefix, e.g. '/Documentation' (or '/' for the unnamed group)
     */
    prefix: string;
    /**
     * the app's base URL / rootURL, e.g. '/my-github-project/' (or '/')
     */
    base: string;
};
//# sourceMappingURL=hydrate.d.ts.map