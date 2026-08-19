import { merge } from 'lodash-es';

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
 *
 * @typedef {(entry: Record<string, unknown>, frontmatter: Record<string, unknown>, context: { path: string }) => Record<string, unknown>} PopulateManifestEntry
 */

/**
 * The default `populateManifestEntry` strategy: the page's frontmatter
 * nests under its `meta` key, deeply merged (lodash merge) with any
 * `meta` the sibling json config already defines — frontmatter wins on
 * collisions. Since it runs for every page (with `{}` when there is no
 * frontmatter), `meta` is always present. Does not mutate its input.
 *
 * Exported so a custom strategy can fall back to (or build on) it.
 *
 * @type {PopulateManifestEntry}
 */
export function defaultPopulateManifestEntry(entry, frontmatter) {
  return { ...entry, meta: merge({}, entry.meta ?? {}, frontmatter) };
}
