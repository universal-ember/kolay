/**
 * apiDocs() receives a string, or an array of strings, where each entry
 * is either
 * - a package name, which must be resolvable from the consuming project
 *   (i.e.: actually installed) — paths within packages are not allowed,
 *   because type entry points are discovered from the package's
 *   package.json#exports — or
 * - a relative path, which must exist on disk.
 *
 * Every entry is checked, and all problems are reported in one error.
 *
 * @param {unknown} input
 * @param {string} cwd
 * @return {string[]} the validated entries, normalized to an array
 */
export function validatePackages(input: unknown, cwd: string): string[];
//# sourceMappingURL=validate.d.ts.map