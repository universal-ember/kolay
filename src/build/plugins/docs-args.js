/**
 * `docs()`'s options: where a group's markdown lives, how to process it,
 * and the groups it collects.
 *
 * @typedef {import('../vite.js').MarkdownOptions & { src?: string, collection?: Array<string | DocsEntry> }} DocsOptions
 */

/**
 * One entry of a `collection`: a group of its own, taking everything a
 * `docs()` usage takes — an `src`, markdown options, and a `collection` of
 * its own.
 *
 * @typedef {DocsOptions & { name?: string }} DocsEntry
 */

/**
 * @typedef {import('../../nav.js').NavNode} NavNode
 */

/**
 * One `docs()` usage, normalized: the groups whose files it contributes,
 * its markdown options, and — on the usage of a group that includes
 * others — the tree that describes.
 *
 * @typedef {object} DocsUsage
 * @property {Array<{ name: string, src?: string }>} groups
 * @property {NavNode} [nav]
 * @property {string} [src]
 * @property {unknown[]} [remarkPlugins]
 * @property {unknown[]} [rehypePlugins]
 * @property {string} [scope]
 */

/**
 * The markdown options an entry of a `collection` inherits from the group
 * that collects it, unless it sets its own. Sitting inside that group's
 * options is what distinguishes it from a separate `docs()` call, which
 * never inherits.
 */
const MARKDOWN_OPTION_KEYS = ['remarkPlugins', 'rehypePlugins', 'scope'];

/**
 * Just the markdown options out of an option bag.
 */
function markdownOptions(options) {
  return Object.fromEntries(
    MARKDOWN_OPTION_KEYS.filter((key) => options[key] !== undefined).map((key) => [
      key,
      options[key],
    ])
  );
}

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
 * - `docs('data', { src, collection: [{ name, src }, ...] })` — a group that
 *   collects other groups into its nav entry (see `collection` below)
 *
 * Returns one normalized usage per group the call contributes — usually
 * one, `{ ...options, groups: [] | [{ name, src }] }`; a `collection`
 * contributes a usage per group in its tree, so every group keeps its own
 * markdown options, and the first of them carries the `nav` tree.
 *
 * @param {string | DocsOptions} [groupName]
 * @param {DocsOptions} [options]
 * @returns {DocsUsage[]}
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

  const { name, src } = parseNameAndSrc(groupName, options, 'docs()');
  const { collection, ...usageOptions } = options;

  if (collection === undefined) {
    if (name && !src) throw missingSrc(name);

    return [{ ...usageOptions, groups: name ? [{ name, src }] : [] }];
  }

  if (!name) {
    throw new Error(
      `docs({ collection: [...] }) has no group to collect them into. A group collects other ` +
        `groups — name it: docs('my-group', { collection: [...] }), with an optional src of ` +
        `its own.`
    );
  }

  const node = parseCollection({ name, src, collection, options: usageOptions }, 'docs()');
  const usages = usagesFor(node, usageOptions);
  const nav = navNode(node);

  // The tree rides on the first usage, which the build reads to place the
  // group and the ones it collects. A group with an src has a usage of its
  // own to carry it; one without needs a nav-only usage, which keeps the
  // markdown options so it behaves like any other usage otherwise.
  if (node.src) return [{ ...usages[0], nav }, ...usages.slice(1)];

  return [{ ...usageOptions, groups: [], nav }, ...usages];
}

/**
 * A group's name and src, from a name-or-path first argument plus
 * options: a pathish first argument is the src, and its last segment the
 * name; an src alone names the group after its last segment.
 *
 * @param {string | undefined} nameOrPath
 * @param {{ src?: string }} options
 * @param {string} source - what to call the caller in error messages
 */
function parseNameAndSrc(nameOrPath, options, source) {
  let name = nameOrPath ?? undefined;
  let src = options.src;

  if (name && isPathish(name)) {
    if (src) {
      throw new Error(
        `${source} received ${describe(name)} and { src: ${describe(src)} }: pass the docs' ` +
          `location either as the name or as src — not both.`
      );
    }

    src = name;
    name = lastSegment(name);
  }

  if (!name && src) {
    name = lastSegment(src);
  }

  if (name === '') {
    throw new Error(
      `Could not derive a group name from ${describe(nameOrPath ?? src)} — ` +
        `pass the group name explicitly: docs('my-group', { src: ... }).`
    );
  }

  return { name, src };
}

function missingSrc(name) {
  return new Error(
    `docs("${name}") needs to know where the group's docs live — ` +
      `pass options.src (e.g.: docs("${name}", { src: import.meta.resolve('./docs') })), ` +
      `or pass a path or URL as the first argument to use its last segment as the group name. ` +
      `(A group with a collection may omit src, and contribute only the pages it collects.)`
  );
}

/**
 * One node of the nav tree a `collection` describes:
 * `{ name, src, options, children }`, children first-to-last.
 *
 * @param {{ name: string, src?: string, collection: unknown, options: object }} node
 * @param {string} source - what to call the caller in error messages
 */
function parseCollection({ name, src, collection, options }, source) {
  if (!Array.isArray(collection) || collection.length === 0) {
    throw new Error(
      `${source} expects options.collection to be a non-empty array of the groups to collect — ` +
        `[{ name: 'a', src: ... }, { name: 'b', src: ... }]. Received: ${describe(collection)}`
    );
  }

  const children = collection.map((given) => {
    // a plain string is a path whose last segment names the group, as it is
    // for a docs() usage and for the config file's own `docs` entries
    const entry = typeof given === 'string' ? { name: given } : given;

    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(
        `A collection's entries describe groups, like a docs() usage does — ` +
          `{ name: 'a', src: ... }. Received: ${describe(given)} (collected by '${name}').`
      );
    }

    const { collection: nested, name: entryName, ...entryOptions } = entry;
    const { name: childName, src: childSrc } = parseNameAndSrc(
      entryName,
      entry,
      `A group collected by '${name}'`
    );

    if (!childName) {
      throw new Error(
        `A group collected by '${name}' has no name, and no src to derive one from — ` +
          `{ name: 'a', src: ... }.`
      );
    }

    // markdown options set here win over the collecting group's; anything
    // else (src) is the entry's own
    const childOptions = { ...markdownOptions(options), ...markdownOptions(entryOptions) };

    if (nested !== undefined) {
      return parseCollection(
        { name: childName, src: childSrc, collection: nested, options: childOptions },
        `A group collected by '${name}'`
      );
    }

    if (!childSrc) throw missingSrc(childName);

    return { name: childName, src: childSrc, options: childOptions, children: [] };
  });

  return { name, src, options: markdownOptions(options), children };
}

/**
 * A usage per group in the tree, depth-first in declaration order, each
 * with its own markdown options. A group without an src contributes no
 * usage of its own — it has no files, only the groups it collects.
 *
 * @param {object} node
 * @param {object} rootOptions - the collecting usage's non-markdown options
 */
function usagesFor(node, rootOptions, isRoot = true) {
  const own = node.src
    ? [
        {
          ...(isRoot ? rootOptions : {}),
          ...node.options,
          groups: [{ name: node.name, src: node.src }],
        },
      ]
    : [];

  return [...own, ...node.children.flatMap((child) => usagesFor(child, rootOptions, false))];
}

/**
 * The tree as the manifest carries it: a node per group, `group` naming
 * the group whose pages it contributes (null when it has none of its own).
 */
function navNode(node) {
  return {
    name: node.name,
    // null when the group has no src: it contributes no pages of its own
    group: node.src ? node.name : null,
    children: node.children.map(navNode),
  };
}
