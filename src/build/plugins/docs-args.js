/**
 * @typedef {object} DocsOptions
 * @property {string} [src] - where the group's markdown lives (a path, or an `import.meta.resolve()`d URL); required when the first argument is a plain group name
 * @property {unknown[]} [remarkPlugins] - remark plugins for this usage's `.gjs.md` files
 * @property {unknown[]} [rehypePlugins] - rehype plugins for this usage's `.gjs.md` files
 * @property {string} [scope] - import statements made available in this usage's live codefences
 * @property {import('./markdown-pages/frontmatter.js').PopulatePageMetadata} [populatePageMetadata] - function to populate `meta` into the documentation manifest. Receives parsed markdown frontmatter and meta.json values; defaults to `defaultFrontmatterMeta`
 */

function describe(value) {
  if (typeof value === 'string') return `"${value}"`;

  try {
    return `${JSON.stringify(value)} (${typeof value})`;
  } catch {
    return typeof value;
  }
}

/**
 * Whether the string is a path or URL (rather than a plain group name).
 */
function isPathish(value) {
  return value.startsWith('file:') || value.startsWith('.') || /[/\\]/.test(value);
}

/**
 * The last path segment, ignoring trailing separators.
 */
function lastSegment(path) {
  const cleaned = path.replace(/[/\\]+$/, '');
  const segments = cleaned.split(/[/\\]/);

  return segments[segments.length - 1];
}

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
export function parseDocsArgs(groupName, options) {
  if (groupName && typeof groupName === 'object') {
    if ('groups' in groupName) {
      throw new Error(
        `docs() no longer takes { groups: [...] } — call it once per group: ` +
          `docs('guides', { src: ... }), or docs(import.meta.resolve('./guides')) ` +
          `(the last segment of a path or URL becomes the group name).`
      );
    }

    // options-only: no group name, maybe an src to derive one from
    return parseDocsArgs(undefined, groupName);
  }

  options ??= {};

  if (groupName !== undefined && groupName !== null && typeof groupName !== 'string') {
    throw new Error(
      `docs() expects a group name (or a path/URL) as its first argument, ` +
        `e.g.: docs('guides', { src: ... }) or docs(import.meta.resolve('./guides')). ` +
        `Received: ${describe(groupName)}`
    );
  }

  let name = groupName ?? undefined;
  let src = options.src;

  if (name && isPathish(name)) {
    if (src) {
      throw new Error(
        `docs(${describe(name)}, { src: ${describe(src)} }): pass the docs' location ` +
          `either as the first argument or as options.src — not both.`
      );
    }

    src = name;
    name = lastSegment(name);
  }

  if (!name && src) {
    name = lastSegment(src);
  }

  if (name && !src) {
    throw new Error(
      `docs("${name}") needs to know where the group's docs live — ` +
        `pass options.src (e.g.: docs("${name}", { src: import.meta.resolve('./docs') })), ` +
        `or pass a path or URL as the first argument to use its last segment as the group name.`
    );
  }

  if (name === '') {
    throw new Error(
      `Could not derive a group name from ${describe(groupName ?? src)} — ` +
        `pass the group name explicitly: docs('my-group', { src: ... }).`
    );
  }

  return {
    ...options,
    groups: name ? [{ name, src }] : [],
  };
}
