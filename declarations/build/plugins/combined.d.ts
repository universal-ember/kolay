/**
 * The markdown-docs plugin: slurps up the group's `.md` / `.gjs.md` files,
 * produces the manifest + page loaders ('kolay/compiled-docs:virtual'),
 * compiles `.gjs.md` at build time, and serves/emits co-located doc assets.
 *
 * One usage per group:
 * - `docs('guides', { src: import.meta.resolve('./guides') })`
 * - `docs(import.meta.resolve('./guides'))` — a path or URL: its last
 *   segment is the group name
 * - `docs()` — no group; only the co-located pages (app/templates, src/templates)
 *
 * @param {string | DocsOptions} [groupName] - the group's name, or a path/URL whose last segment is the group name (the path then also serves as the group's `src`)
 * @param {DocsOptions} [options]
 */
export function docsPlugins(groupName?: string | DocsOptions, options?: DocsOptions): (import("unplugin").UnpluginOptions | {
    name: string;
    config(config: any): void;
} | ({
    name: string;
    resolveId: {
        filter: {
            id: RegExp;
        };
        handler(id: any, parent: any): Promise<string>;
    };
    load: {
        filter: {
            id: RegExp;
        };
        handler(id: any): Promise<{
            code: string;
            map: string;
        }>;
    };
    enforce?: undefined;
    configResolved?: undefined;
} | {
    name: string;
    enforce: string;
    configResolved(resolvedConfig: any): void;
    load: {
        filter: {
            id: {
                include: any[];
                exclude: any[];
            };
        };
        handler(id: any): Promise<any>;
    };
    resolveId?: undefined;
})[])[];
/**
 * The api-docs plugin: generates typedoc JSON for the given packages
 * and provides 'kolay/api-docs:virtual' for loading it.
 *
 * Receives a string, or an array of strings — package names (which must
 * be installed / resolvable from your project) and/or relative paths
 * (which must exist). Every entry is validated up front, and all
 * problems are reported in one error.
 *
 * Requires the `docs()` plugin to also be present.
 *
 * @param {string | string[]} input
 */
export function apiDocsPlugins(input: string | string[]): import("unplugin").UnpluginOptions[];
/**
 * The demos plugin: aliases a directory of demo components so code
 * fences can import them — `demos(path, { as: '#demos/foo' })` enables
 * `import ... from '#demos/foo/<demo>'`. The runtime compiler
 * learns the aliases automatically through `setupKolay`.
 *
 * @param {string} src - where the demos live (a path, or an `import.meta.resolve()`d URL)
 * @param {{ as: string }} options
 */
export function demosPlugins(src: string, options: {
    as: string;
}): import("unplugin").UnpluginOptions[];
/**
 * The import-entrypoints plugin: enumerates a package's
 * package.json#exports and teaches the runtime compiler every
 * entrypoint, so `.md` fences can import the package with no
 * `modules` configuration.
 *
 * @param {string} input - a package name, or a path to a directory containing a package.json
 * @param {{ exclude?: string[] }} [options]
 */
export function importEntrypointsPlugins(input: string, options?: {
    exclude?: string[];
}): import("unplugin").UnpluginOptions[];
/**
 * unplugin factories only receive one argument, so the public two-argument
 * form (see 'kolay/vite') passes `[groupName, options]` as a tuple.
 */
export const docs: import("unplugin").UnpluginInstance<any, boolean>;
export { apiDocsUnplugin as apiDocs };
/**
 * unplugin factories only receive one argument, so the public
 * two-argument form (see 'kolay/vite') passes `[src, options]` as a tuple.
 */
export const demos: import("unplugin").UnpluginInstance<any, boolean>;
/**
 * unplugin factories only receive one argument, so the public
 * two-argument form (see 'kolay/vite') passes `[input, options]` as a tuple.
 */
export const importEntrypoints: import("unplugin").UnpluginInstance<any, boolean>;
export type DocsOptions = import("./docs-args.js").DocsOptions;
declare const apiDocsUnplugin: import("unplugin").UnpluginInstance<string | string[], boolean>;
//# sourceMappingURL=combined.d.ts.map