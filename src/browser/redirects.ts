import { equalsIgnoreCase } from './utils.ts';

const SUBTREE = '/*';

/**
 * Resolves a visited path against the project's redirects (from the
 * kolay config file, carried on `Manifest.redirects`).
 *
 * `path` is the URL path within the docs mount, without a leading slash
 * (the same space the wildcard route's param lives in — for a root
 * mount, the app-relative path).
 *
 * Entries are plain path prefixes, matched whole-segment and
 * case-insensitively. A trailing `/*` matches the prefix itself and
 * everything under it (the remainder is preserved onto `to`); without
 * it, only that exact path matches.
 *
 * The first matching entry wins, and redirects don't chain: the result
 * is not itself resolved again (config validation guarantees no entry's
 * `to` lands where another's `from` would match).
 *
 * Returns the rewritten path, or `undefined` when nothing matches.
 */
export function resolveRedirect(
  path: string,
  redirects: { from: string; to: string }[]
): string | undefined {
  for (const { from, to } of redirects) {
    if (from.endsWith(SUBTREE)) {
      const prefix = from.slice(0, -SUBTREE.length);
      const target = to.slice(0, -SUBTREE.length);

      if (equalsIgnoreCase(path, prefix)) return target;

      const head = path.slice(0, prefix.length);

      if (equalsIgnoreCase(head, prefix) && path[prefix.length] === '/') {
        return target + path.slice(prefix.length);
      }
    } else if (equalsIgnoreCase(path, from)) {
      return to;
    }
  }

  return undefined;
}
