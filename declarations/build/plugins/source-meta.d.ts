/**
 * The repository root containing `dir`: the nearest ancestor with a
 * `.git` entry (a directory — or a file, for worktrees and submodules).
 *
 * @param {string} dir
 * @returns {string | undefined}
 */
export function findRepoRoot(dir: string): string | undefined;
/**
 * package.json's `repository` (string or object form) → a browsable
 * https URL.
 *
 * @param {string | { type?: string; url?: string } | undefined} repository
 * @returns {string | undefined}
 */
export function repositoryUrl(repository: string | {
    type?: string;
    url?: string;
} | undefined): string | undefined;
/**
 * The meta for one docs() source:
 * - `url`: the repository URL, from the `repository` field of the
 *   package.json at the repository root
 * - `docsPath`: the repo-relative path to the source's docs
 * - anything else from a `meta.jsonc` (or `meta.json`) at the root of
 *   the source, mixed in (user keys win)
 *
 * @param {string} sourceCwd
 * @returns {Promise<Record<string, unknown>>}
 */
export function sourceMeta(sourceCwd: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=source-meta.d.ts.map