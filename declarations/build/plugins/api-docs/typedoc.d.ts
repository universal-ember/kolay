/**
 * Generates APIDocs / TypeDoc from already built declarations. This is meant to use be very permissive and ignore errors so that likelihood of generating a TypeDoc json document increases.
 * Over time, this'll probably need to be tweaked, and maybe one day will need an extension API, but for now the only option is specifying which `packageName` to try to generate types for.
 *
 * Package lookup occurs relative to the package at the current working directory, using `require.resolve`.
 * So only packages declared as (dev)dependencies entries can be found.
 *
 * @typedef {object} Options
 * @property {string} packageName
 *
 * @param {Options} options
 * @return {Promise<unknown | undefined>} either the built JSON document, or undefined
 */
export function generateTypeDocJSON({ packageName }: Options): Promise<unknown | undefined>;
/**
 * Generates APIDocs / TypeDoc from already built declarations. This is meant to use be very permissive and ignore errors so that likelihood of generating a TypeDoc json document increases.
 * Over time, this'll probably need to be tweaked, and maybe one day will need an extension API, but for now the only option is specifying which `packageName` to try to generate types for.
 *
 * Package lookup occurs relative to the package at the current working directory, using `require.resolve`.
 * So only packages declared as (dev)dependencies entries can be found.
 */
export type Options = {
    packageName: string;
};
//# sourceMappingURL=typedoc.d.ts.map