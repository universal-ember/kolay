/**
 * docs() takes (groupName, options):
 *
 * - `docs('guides', { src: import.meta.resolve('./guides') })`
 * - `docs(import.meta.resolve('./guides'))` — when the first argument is a
 *   path or URL, its last segment is the group name, and it is the group's src
 * - `docs()` — no group: only the co-located pages (app/templates, src/templates)
 * - `docs({ ...options })` — no group, with markdown options
 *
 * Normalizes to the internal shape: `{ ...options, groups: [] | [{ name, src }] }`.
 *
 * @param {string | DocsOptions} [groupName]
 * @param {DocsOptions} [options]
 */
export function parseDocsArgs(groupName?: string | DocsOptions, options?: DocsOptions): {
    groups: {
        name: string;
        src: string | undefined;
    }[];
    /**
     * - where the group's markdown lives (a path, or an `import.meta.resolve()`d URL); required when the first argument is a plain group name
     */
    src?: string | undefined;
    /**
     * - remark plugins for this usage's `.gjs.md` files
     */
    remarkPlugins?: unknown[] | undefined;
    /**
     * - rehype plugins for this usage's `.gjs.md` files
     */
    rehypePlugins?: unknown[] | undefined;
    /**
     * - import statements made available in this usage's live codefences
     */
    scope?: string | undefined;
};
export type DocsOptions = {
    /**
     * - where the group's markdown lives (a path, or an `import.meta.resolve()`d URL); required when the first argument is a plain group name
     */
    src?: string | undefined;
    /**
     * - remark plugins for this usage's `.gjs.md` files
     */
    remarkPlugins?: unknown[] | undefined;
    /**
     * - rehype plugins for this usage's `.gjs.md` files
     */
    rehypePlugins?: unknown[] | undefined;
    /**
     * - import statements made available in this usage's live codefences
     */
    scope?: string | undefined;
};
//# sourceMappingURL=docs-args.d.ts.map