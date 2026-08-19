import { trimSlashes } from '../paths.js';
import { equalsIgnoreCase, samePagePath } from './utils.ts';

import type Transition from '@ember/routing/transition';

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
 * it, only that exact path matches — with the `.md` extension ignored,
 * since pages are visitable with and without it.
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
    } else if (samePagePath(path, from)) {
      // pages are visitable with and without `.md`, so exact entries
      // match either form of the visited path
      return to;
    }
  }

  return undefined;
}

/**
 * Where a transition should redirect to, if anywhere: its intended URL,
 * resolved against the project's redirects. `setupKolay` wires this
 * into the router service's `routeWillChange` for you.
 *
 * Returns an app-relative URL (leading slash — ready for
 * `router.transitionTo`), or `undefined` when no entry matches (or the
 * transition wasn't URL-initiated — a `transitionTo(name, ...models)`
 * can't target a redirected URL, since redirected URLs have no route of
 * their own to name).
 */
export function redirectTargetFor(
  transition: Transition,
  redirects: { from: string; to: string }[]
): string | undefined {
  if (redirects.length === 0) return undefined;

  // The intended URL is app-relative (Ember's location layer strips the
  // rootURL before the router sees a URL). `intent` isn't in the public
  // Transition type, but it is where the target URL lives.
  const { intent } = transition as { intent?: { url?: unknown } };

  if (typeof intent?.url !== 'string') return undefined;

  return redirectForUrl(intent.url, redirects);
}

/** Where a redirect sends this URL, ignoring its query and hash. */
export function redirectForUrl(
  url: string,
  redirects: { from: string; to: string }[]
): string | undefined {
  const [path = ''] = url.split(/[?#]/);
  const target = resolveRedirect(trimSlashes(path, { leading: true }), redirects);

  return target === undefined ? undefined : '/' + target;
}
