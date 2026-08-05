import { lilconfig } from 'lilconfig';

/**
 * @typedef {{ from: string, to: string }} Redirect
 */

const SUBTREE = '/*';

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

  return aPrefix.toLowerCase() === bPrefix.toLowerCase();
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
      .find((other) => other.from.toLowerCase() === entry.from.toLowerCase());

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
 * Discovers the project's kolay config file — via `lilconfig('kolay')`'s
 * default search (`kolay.config.{js,cjs,mjs}`, `.kolayrc.{json,js,cjs,mjs}`,
 * a `.config/` variant of those, or a `"kolay"` key in package.json) —
 * upward from `cwd`, and returns its validated `redirects`.
 *
 * `[]` when there is no config file, or it has no `redirects`.
 *
 * @param {string} cwd
 * @returns {Promise<Redirect[]>}
 */
export async function loadRedirects(cwd) {
  const result = await lilconfig('kolay').search(cwd);

  if (!result || result.isEmpty) return [];

  return validateRedirects(result.config?.redirects, result.filepath);
}
