/**
 * Gather the `types` entries from `package.json#exports`
 *
 * @param {string} packageName
 */
export function packageTypes(packageName: string): Promise<{
    manifest: any;
    dir: string;
    types: string[];
}>;
/**
 * extracting types versions requires knowledge of which typescript version we're using.
 * So, instead, we're going to use use the top-most entry in the typesVersion  list.
 *
 * Additionally, the result of types _can be_ an array, rather than a string, as required by exports.
 *
 * e.g.:
 *
 * "typesVersions": {
 *  [version or range of typescript]: {
 *    [path pattern]: [files, to, include],
 *    [path pattern]: "can be a single file"
 *  }
 * }
 *
 * This structure is much simpler than exports though
 *
 * @param {object} typesVersions
 * @returns {string[]}
 */
export function extractTypesVersions(typesVersions: object): string[];
/**
 *
 * @param {object} exports
 * @param {string} kind
 * @param {string[]} conditions
 * @returns {string[]}
 */
export function extractExports(exports: object, kind: string, conditions?: string[]): string[];
/**
 * Create a virtual file in a rollup-based API by only specifying the desired import path and the content of the virtual file.
 *
 * @typedef {object} VirtualFileOptions
 * @property {string} importPath
 * @property {string} content
 *
 * @param {VirtualFileOptions | VirtualFileOptions[]} options
 * @return {Omit<import('unplugin').UnpluginOptions, 'name'>}
 */
export function virtualFile(options: VirtualFileOptions | VirtualFileOptions[]): Omit<import("unplugin").UnpluginOptions, "name">;
/**
 * I used to use \0 for the prefix, but when explicitly
 * using the prefix in our own virtual modules (importing other virtual modules),
 * we get an error:
 *   Module not found:
 *     TypeError [ERR_INVALID_ARG_VALUE]:
 *       The argument 'path' must be a string, Uint8Array, or URL without null bytes.
 *       Received '<consuming-project-path>/node_modules/\x00kolay/package.json'
 *
 * I had also tried using `virtual:` for a prefix, but webpack doesn't allow that
 *   Webpack supports "data:" and "file:" URIs by default
 *   You may need an additional plugin to handle "virtual:" URIs.
 */
export const INTERNAL_PREFIX: "\0";
/**
 * Create a virtual file in a rollup-based API by only specifying the desired import path and the content of the virtual file.
 */
export type VirtualFileOptions = {
    importPath: string;
    content: string;
};
//# sourceMappingURL=helpers.d.ts.map