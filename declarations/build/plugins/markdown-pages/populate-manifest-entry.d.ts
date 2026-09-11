export function defaultPopulateManifestEntry(entry: Record<string, unknown>, frontmatter: Record<string, unknown>, context: {
    path: string;
}): Record<string, unknown>;
/**
 * Finalizes a page's entry in the documentation manifest.
 *
 * Called for every markdown page with the default entry kolay built —
 * its derived `path`, `name`, `groupName`, and `cleanedName`, plus the
 * contents of the page's sibling json/jsonc config — and the page's
 * parsed YAML frontmatter (`{}` when the page has none). Whatever it
 * returns becomes the page's entry, so it may add, reshape, or override
 * any key, including the derived ones. Defaults to
 * `defaultPopulateManifestEntry`.
 */
export type PopulateManifestEntry = (entry: Record<string, unknown>, frontmatter: Record<string, unknown>, context: {
    path: string;
}) => Record<string, unknown>;
//# sourceMappingURL=populate-manifest-entry.d.ts.map