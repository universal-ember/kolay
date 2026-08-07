/**
 * One redirect: an old path and where it now lives. A trailing `/*`
 * (on both `from` and `to`) matches the whole subtree.
 *
 * @typedef {object} Redirect
 * @property {string} from - the old path
 * @property {string} to - the destination
 */
/**
 * Markdown options shared by every docs group (a group's own options
 * win). Plugin functions require a JS config form.
 *
 * @typedef {object} MarkdownOptions
 * @property {unknown[]} [remarkPlugins] - remark plugins for the groups' `.gjs.md` files
 * @property {unknown[]} [rehypePlugins] - rehype plugins for the groups' `.gjs.md` files
 * @property {string} [scope] - import statements made available in the groups' live codefences
 */
/**
 * One `docs()` usage. A plain string entry is shorthand for a path
 * whose last segment names the group.
 *
 * @typedef {object} DocsEntry
 * @property {string} [name] - the group name
 * @property {string} [src] - where the group's pages live; relative paths resolve from the config file's directory
 * @property {unknown[]} [remarkPlugins] - remark plugins for this group's `.gjs.md` files
 * @property {unknown[]} [rehypePlugins] - rehype plugins for this group's `.gjs.md` files
 * @property {string} [scope] - import statements made available in this group's live codefences
 */
/**
 * One `demos()` usage.
 *
 * @typedef {object} DemosEntry
 * @property {string} src - where the demo components live; relative paths resolve from the config file's directory
 * @property {string} as - the import alias, e.g. '#demos/site'
 */
/**
 * One `importEntrypoints()` usage. A plain string entry is shorthand
 * for `{ input }`.
 *
 * @typedef {object} ImportEntrypointsEntry
 * @property {string} input - a package name, or a path to a directory containing a package.json
 * @property {string[]} [exclude] - subpath keys to leave out
 */
/**
 * What a kolay.config.js may export. Every key is optional; when a key
 * isn't specified, the plugin for it is not included in your app.
 *
 * @typedef {object} KolayConfigInput
 * @property {Array<string | DocsEntry> | string | DocsEntry} [docs] - the docs groups; one `docs()` usage per entry
 * @property {string[] | string} [apiDocs] - package names / paths to generate typedoc for
 * @property {DemosEntry[] | DemosEntry} [demos] - demo directories; one `demos()` usage per entry
 * @property {Array<string | ImportEntrypointsEntry> | string | ImportEntrypointsEntry} [importEntrypoints] - packages live codefences may import; one `importEntrypoints()` usage per entry
 * @property {MarkdownOptions} [markdownOptions] - markdown options shared by every docs group
 * @property {Redirect[]} [redirects] - old paths and where they now live
 */
/**
 * Helper for authoring kolay.config.js: types the config for editor
 * completion and checking, and validates the known keys while the
 * config file is evaluated, so errors point at the file itself.
 *
 * ```js
 * // kolay.config.js
 * import { defineConfig } from 'kolay/vite';
 *
 * export default defineConfig({
 *   docs: [{ name: 'Runtime', src: import.meta.resolve('../docs') }],
 * });
 * ```
 *
 * @param {KolayConfigInput} config
 * @returns {KolayConfigInput}
 */
export function defineConfig(config: KolayConfigInput): KolayConfigInput;
/**
 * The markdown-docs plugin. One usage per group:
 *
 * - `docs('guides', { src: import.meta.resolve('./guides') })`
 * - `docs(import.meta.resolve('./guides'))` — a path or URL: its last
 *   segment is the group name
 * - `docs()` — no group; only the co-located pages (app/templates, src/templates)
 *
 * @param {string | import('./plugins/docs-args.js').DocsOptions} [groupName] - the group's name, or a path/URL whose last segment is the group name (the path then also serves as the group's `src`)
 * @param {import('./plugins/docs-args.js').DocsOptions} [options]
 */
export function docs(groupName?: string | import("./plugins/docs-args.js").DocsOptions, options?: import("./plugins/docs-args.js").DocsOptions): import("vite").Plugin<any> | import("vite").Plugin<any>[];
/**
 * The demos plugin: aliases a directory of demo components so code
 * fences can import them —
 *
 * `demos(import.meta.resolve('./demos'), { as: '#demos/foo' })` enables
 * `import ... from '#demos/foo/<demo>'` in live codefences.
 * The runtime compiler learns the aliases automatically, so `.md`
 * fences need no `modules` configuration.
 *
 * @param {string} src - where the demos live (a path, or an `import.meta.resolve()`d URL)
 * @param {{ as: string }} options
 */
export function demos(src: string, options: {
    as: string;
}): any;
/**
 * The import-entrypoints plugin: enumerates a package's
 * package.json#exports and teaches the runtime compiler every
 * entrypoint — `importEntrypoints('ember-primitives')` lets `.md`
 * live codefences `import ... from 'ember-primitives/<anything>'`
 * with no `modules` configuration.
 *
 * @param {string} input - a package name, or a path to a directory containing a package.json
 * @param {{ exclude?: string[] }} [options] - subpath keys to leave out (exact, or ending in '*') — e.g. node-only entrypoints
 */
export function importEntrypoints(input: string, options?: {
    exclude?: string[];
}): any;
export { kolay } from "./plugins/from-config.js";
/**
 * The api-docs plugin (requires `docs` to also be used).
 */
export const apiDocs: (options: string | string[]) => import("vite").Plugin<any> | import("vite").Plugin<any>[];
/**
 * One redirect: an old path and where it now lives. A trailing `/*`
 * (on both `from` and `to`) matches the whole subtree.
 */
export type Redirect = {
    /**
     * - the old path
     */
    from: string;
    /**
     * - the destination
     */
    to: string;
};
/**
 * Markdown options shared by every docs group (a group's own options
 * win). Plugin functions require a JS config form.
 */
export type MarkdownOptions = {
    /**
     * - remark plugins for the groups' `.gjs.md` files
     */
    remarkPlugins?: unknown[] | undefined;
    /**
     * - rehype plugins for the groups' `.gjs.md` files
     */
    rehypePlugins?: unknown[] | undefined;
    /**
     * - import statements made available in the groups' live codefences
     */
    scope?: string | undefined;
};
/**
 * One `docs()` usage. A plain string entry is shorthand for a path
 * whose last segment names the group.
 */
export type DocsEntry = {
    /**
     * - the group name
     */
    name?: string | undefined;
    /**
     * - where the group's pages live; relative paths resolve from the config file's directory
     */
    src?: string | undefined;
    /**
     * - remark plugins for this group's `.gjs.md` files
     */
    remarkPlugins?: unknown[] | undefined;
    /**
     * - rehype plugins for this group's `.gjs.md` files
     */
    rehypePlugins?: unknown[] | undefined;
    /**
     * - import statements made available in this group's live codefences
     */
    scope?: string | undefined;
};
/**
 * One `demos()` usage.
 */
export type DemosEntry = {
    /**
     * - where the demo components live; relative paths resolve from the config file's directory
     */
    src: string;
    /**
     * - the import alias, e.g. '#demos/site'
     */
    as: string;
};
/**
 * One `importEntrypoints()` usage. A plain string entry is shorthand
 * for `{ input }`.
 */
export type ImportEntrypointsEntry = {
    /**
     * - a package name, or a path to a directory containing a package.json
     */
    input: string;
    /**
     * - subpath keys to leave out
     */
    exclude?: string[] | undefined;
};
/**
 * What a kolay.config.js may export. Every key is optional; when a key
 * isn't specified, the plugin for it is not included in your app.
 */
export type KolayConfigInput = {
    /**
     * - the docs groups; one `docs()` usage per entry
     */
    docs?: string | DocsEntry | (string | DocsEntry)[] | undefined;
    /**
     * - package names / paths to generate typedoc for
     */
    apiDocs?: string | string[] | undefined;
    /**
     * - demo directories; one `demos()` usage per entry
     */
    demos?: DemosEntry | DemosEntry[] | undefined;
    /**
     * - packages live codefences may import; one `importEntrypoints()` usage per entry
     */
    importEntrypoints?: string | ImportEntrypointsEntry | (string | ImportEntrypointsEntry)[] | undefined;
    /**
     * - markdown options shared by every docs group
     */
    markdownOptions?: MarkdownOptions | undefined;
    /**
     * - old paths and where they now live
     */
    redirects?: Redirect[] | undefined;
};
//# sourceMappingURL=vite.d.ts.map