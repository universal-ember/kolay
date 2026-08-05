import { lilconfig } from 'lilconfig';

/**
 * @typedef {{ from: string, to: string }} Redirect
 *
 * The markdown options shared by every docs group (a group's own
 * options win). Plugin functions require a JS config form.
 * @typedef {Omit<import('./docs-args.js').DocsOptions, 'src'>} MarkdownOptions
 *
 * One `docs()` usage: a group name and where its pages live (relative
 * paths resolve from the config file's directory), plus any per-group
 * markdown options. A plain string is shorthand for a path whose last
 * segment names the group.
 * @typedef {{ name?: string } & import('./docs-args.js').DocsOptions} DocsEntry
 *
 * @typedef {object} DemosEntry - one `demos()` usage
 * @property {string} src - where the demo components live; relative paths resolve from the config file's directory
 * @property {string} as - the import alias, e.g. '#demos/site'
 *
 * @typedef {object} ImportEntrypointsEntry - one `importEntrypoints()` usage; a plain string is shorthand for `{ input }`
 * @property {string} input - a package name, or a path to a directory containing a package.json
 * @property {string[]} [exclude] - subpath keys to leave out
 *
 * What a kolay.config.js may export.
 * @typedef {object} KolayConfigInput
 * @property {Redirect[]} [redirects]
 * @property {Array<string | DocsEntry> | string | DocsEntry} [docs]
 * @property {string[] | string} [apiDocs]
 * @property {DemosEntry[] | DemosEntry} [demos]
 * @property {Array<string | ImportEntrypointsEntry> | string | ImportEntrypointsEntry} [importEntrypoints]
 * @property {MarkdownOptions} [markdownOptions]
 *
 * The loaded config: the known keys validated and defaulted.
 * @typedef {KolayConfigInput & { redirects: Redirect[] }} KolayConfig
 */

/**
 * Identity helper for authoring kolay.config.js with editor types:
 *
 * ```js
 * // kolay.config.js
 * import { defineConfig } from 'kolay/vite';
 *
 * export default defineConfig({
 *   docs: [{ name: 'Runtime', src: '../docs' }],
 * });
 * ```
 *
 * @param {KolayConfigInput} config
 * @returns {KolayConfigInput}
 */
export function defineConfig(config) {
  return config;
}

const SUBTREE = '/*';

/**
 * lilconfig's default search places (which it doesn't export), widened:
 * the rc and config-file forms are also looked for in a `config/`
 * directory (the defaults only cover `.config/`, and only for rc
 * forms). File names only — lilconfig's loaders own the extensions.
 */
const RC_FORMS = ['kolayrc', 'kolayrc.json', 'kolayrc.js', 'kolayrc.cjs', 'kolayrc.mjs'];
const CONFIG_FORMS = ['kolay.config.js', 'kolay.config.cjs', 'kolay.config.mjs'];

export const searchPlaces = [
  'package.json',
  ...RC_FORMS.map((form) => `.${form}`),
  ...CONFIG_FORMS,
  ...['.config', 'config'].flatMap((dir) =>
    [...RC_FORMS, ...CONFIG_FORMS].map((form) => `${dir}/${form}`)
  ),
];

/**
 * @param {string} path
 */
function normalize(path) {
  return path.startsWith('/') ? path.slice(1) : path;
}

/**
 * The path space a redirect entry matches: its prefix for a `/*` subtree
 * entry, the whole path for an exact entry.
 *
 * @param {string} path
 */
function prefixOf(path) {
  return path.endsWith(SUBTREE) ? path.slice(0, -SUBTREE.length) : path;
}

/**
 * A comparison key for an exact page path: lowercased, with the
 * optional `.md` extension stripped (pages are visitable either way).
 *
 * @param {string} path
 */
function pageKey(path) {
  const lowered = path.toLowerCase();

  return lowered.endsWith('.md') ? lowered.slice(0, -3) : lowered;
}

/**
 * Whether `path` is inside the subtree rooted at `prefix`
 * (the prefix itself, or anything under it), case-insensitively.
 *
 * @param {string} path
 * @param {string} prefix
 */
function withinSubtree(path, prefix) {
  const lowered = path.toLowerCase();
  const loweredPrefix = prefix.toLowerCase();

  return lowered === loweredPrefix || lowered.startsWith(loweredPrefix + '/');
}

/**
 * Whether some path could be matched by both entries' `from`s — for
 * subtree entries, one prefix's subtree containing the other's.
 *
 * @param {Redirect} a
 * @param {Redirect} b
 */
function fromSpacesIntersect(a, b) {
  const aSubtree = a.from.endsWith(SUBTREE);
  const bSubtree = b.from.endsWith(SUBTREE);
  const aPrefix = prefixOf(a.from);
  const bPrefix = prefixOf(b.from);

  if (aSubtree && bSubtree)
    return withinSubtree(aPrefix, bPrefix) || withinSubtree(bPrefix, aPrefix);
  if (aSubtree) return withinSubtree(bPrefix, aPrefix);
  if (bSubtree) return withinSubtree(aPrefix, bPrefix);

  return pageKey(aPrefix) === pageKey(bPrefix);
}

/**
 * Whether any path produced by `entry`'s `to` could be matched by
 * `candidate`'s `from`.
 *
 * @param {Redirect} entry
 * @param {Redirect} candidate
 */
function targetIsRedirectable(entry, candidate) {
  return fromSpacesIntersect({ from: entry.to }, candidate);
}

/**
 * Validates a config file's `redirects` value, returning the normalized
 * entries (leading `/` stripped). Throws — naming `source`, the config
 * file the value came from — for:
 *
 * - a value that isn't an array of `{ from: string, to: string }`
 * - an entry where exactly one of `from` / `to` ends in `/*`
 * - an empty `from` / `to` (or a bare `/*`)
 * - two entries with the same `from` (case-insensitive) — ambiguous,
 *   since only the first could ever apply
 * - an entry whose `to` lands where any entry's `from` (its own
 *   included) would match — redirects don't chain, so every target must
 *   be a final destination. This also rules out redirect loops
 *   (self-referencing entries, ping-pong pairs, and prefixes that
 *   rewrite into themselves) by construction.
 *
 * @param {unknown} value
 * @param {string} source
 * @returns {Redirect[]}
 */
export function validateRedirects(value, source) {
  if (value === undefined) return [];

  const fail = (/** @type {string} */ message) => {
    throw new Error(`Invalid \`redirects\` in ${source}: ${message}`);
  };

  if (!Array.isArray(value)) {
    fail(`expected an array of { from, to }, got ${typeof value}`);
  }

  /** @type {Redirect[]} */
  const redirects = [];

  for (const entry of value) {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      typeof entry.from !== 'string' ||
      typeof entry.to !== 'string'
    ) {
      fail(`every entry must be { from: string, to: string }, got ${JSON.stringify(entry)}`);
    }

    const subtree = entry.from.endsWith(SUBTREE);

    if (subtree !== entry.to.endsWith(SUBTREE)) {
      fail(
        `\`from\` and \`to\` must agree on whether they end in \`/*\` ` +
          `(both, or neither), got { from: '${entry.from}', to: '${entry.to}' }`
      );
    }

    const fromPrefix = normalize(prefixOf(entry.from));
    const toPrefix = normalize(prefixOf(entry.to));

    if (!fromPrefix || !toPrefix) {
      fail(
        `\`from\` and \`to\` must be non-empty paths, got { from: '${entry.from}', to: '${entry.to}' }`
      );
    }

    const suffix = subtree ? SUBTREE : '';

    redirects.push({ from: fromPrefix + suffix, to: toPrefix + suffix });
  }

  for (const [i, entry] of redirects.entries()) {
    const duplicate = redirects
      .slice(i + 1)
      .find((other) => pageKey(other.from) === pageKey(entry.from));

    if (duplicate) {
      fail(`two entries share the \`from\` '${entry.from}' — only the first could ever apply`);
    }
  }

  for (const entry of redirects) {
    const chained = redirects.find((candidate) => targetIsRedirectable(entry, candidate));

    if (chained) {
      fail(
        `the target '${entry.to}' is itself matched by the redirect from '${chained.from}'. ` +
          `Redirects don't chain — point \`to\` at the final destination.`
      );
    }
  }

  return redirects;
}

/**
 * Discovers and loads the project's kolay config file (see
 * `searchPlaces`), searching upward from `cwd`. The whole config is
 * returned, with the known keys validated and defaulted, along with the
 * discovered file's path (undefined when there is no config file) —
 * relative paths inside the config resolve from the file's directory.
 *
 * @param {string} cwd
 * @returns {Promise<{ config: KolayConfig, filepath: string | undefined }>}
 */
export async function loadKolayConfig(cwd) {
  const result = await lilconfig('kolay', { searchPlaces }).search(cwd);

  const config = (result && !result.isEmpty && result.config) || {};

  return {
    config: {
      ...config,
      redirects: validateRedirects(config.redirects, result?.filepath ?? 'the kolay config'),
    },
    filepath: result?.filepath ?? undefined,
  };
}
