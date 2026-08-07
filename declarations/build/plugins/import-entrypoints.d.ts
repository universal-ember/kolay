/**
 * The import specifiers a package's `exports` provides:
 *
 * - `.` → the package name; `./components` → `<name>/components`
 * - wildcard keys (`./*`) expand against the package's files: each
 *   target pattern's captures are substituted back into the key
 * - every candidate is then verified through `resolve.exports` — the
 *   same resolution the runtime uses (repl-sdk resolves with it too) —
 *   so conditions, key specificity, and blocking behave exactly like
 *   the real thing; types-only and blocked entries drop out here
 * - `./package.json` and the addon-main tooling entries are skipped
 * - a package without `exports` provides just its name
 *
 * @param {string} name - the package's name
 * @param {unknown} exports - the package.json#exports value
 * @param {{ exclude?: string[], dir?: string }} [options] - `dir` (the package's directory) is required to expand wildcard keys
 * @returns {string[]}
 */
export function entrypointsFromExports(name: string, exports: unknown, options?: {
    exclude?: string[];
    dir?: string;
}): string[];
/**
 * Locates the package.json for the given input: a package name
 * (resolved from cwd, like the bundler will) or a path to a directory
 * containing a package.json.
 *
 * @param {string} input
 * @param {string} cwd
 * @returns {{ name: string, exports: unknown, dir: string }}
 */
export function resolvePackageJson(input: string, cwd: string): {
    name: string;
    exports: unknown;
    dir: string;
};
/**
 * importEntrypoints() takes (packageNameOrPath, options?):
 *
 * - `importEntrypoints('ember-primitives')`
 * - `importEntrypoints('./packages/my-lib')` — a directory containing
 *   a package.json
 * - `importEntrypoints('kolay', { exclude: ['./vite', './build*'] })`
 *
 * @param {string} input
 * @param {{ exclude?: string[] }} [options]
 * @returns {{ input: string, entrypoints: string[] }}
 */
export function parseImportEntrypointsArgs(input: string, options?: {
    exclude?: string[];
}): {
    input: string;
    entrypoints: string[];
};
/**
 * The import-entrypoints plugin: enumerates a package's
 * package.json#exports and teaches the runtime compiler every
 * entrypoint, so `.md` fences can import the package with no
 * `modules` configuration —
 *
 * ```js
 * // vite.config.js
 * importEntrypoints('ember-primitives');
 * ```
 *
 * ```js
 * // any .md live codefence
 * import { ExternalLink } from 'ember-primitives';
 * ```
 *
 * ('kolay/import-entrypoints:virtual' feeds the generated `setupKolay`.)
 *
 * @type {(state: { options: { input: string, entrypoints: string[] }, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions}
 */
export const importEntrypoints: (state: {
    options: {
        input: string;
        entrypoints: string[];
    };
    usages: object[];
    isPrimary: boolean;
}) => import("unplugin").UnpluginOptions;
//# sourceMappingURL=import-entrypoints.d.ts.map