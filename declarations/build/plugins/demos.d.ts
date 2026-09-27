/**
 * demos() takes (pathToDemos, { as }):
 *
 * - `demos(import.meta.resolve('./demos'), { as: '#demos/foo' })`
 *
 * The `as` is the import specifier, used verbatim — any valid import
 * URI works; the `#` prefix (Node's subpath-import convention) makes
 * it unmistakably not-an-npm-package.
 *
 * @param {string} src - where the demos live (a path, or an `import.meta.resolve()`d URL)
 * @param {{ as: string }} options
 * @returns {{ src: string, alias: string }}
 */
export function parseDemosArgs(src: string, options: {
    as: string;
}): {
    src: string;
    alias: string;
};
/**
 * Every specifier a demos() source provides, mapped to the file it
 * resolves to:
 *
 * - each file, without its extension: `<as>/<file>`
 * - an index file also provides its directory:
 *   `<as>` (root), `<as>/<dir>` (nested)
 *
 * @param {string} alias
 * @param {string} src - absolute path to the demos
 * @param {string[]} entries - files, relative to src
 * @returns {Record<string, string>} specifier → absolute file path
 */
export function demoSpecifiers(alias: string, src: string, entries: string[]): Record<string, string>;
/**
 * The demos plugin: aliases a directory of demo components so code
 * fences can import them —
 *
 * ```js
 * // vite.config.js
 * demos(import.meta.resolve('./demos'), { as: '#demos/foo' });
 * ```
 *
 * ```js
 * // any live codefence, .md or .gjs.md
 * import Example from '#demos/foo/example';
 * ```
 *
 * The runtime compiler learns these automatically ('kolay/demos:virtual'
 * feeds `setupKolay`), so `.md` fences need no `modules` configuration.
 *
 * @type {(state: { options: { src: string, alias: string }, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions}
 */
export const demos: (state: {
    options: {
        src: string;
        alias: string;
    };
    usages: object[];
    isPrimary: boolean;
}) => import("unplugin").UnpluginOptions;
//# sourceMappingURL=demos.d.ts.map