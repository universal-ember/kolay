import { equalsIgnoreCase } from './utils.ts';

import type RouteInfo from '@ember/routing/route-info';
import type RouterService from '@ember/routing/router-service';

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

/**
 * Where a transition's destination should redirect to, if anywhere:
 * the app-relative URL the RouteInfo resolves to, resolved against the
 * project's redirects. `setupKolay` wires this into the router service's
 * `routeWillChange` for you.
 *
 * Returns an app-relative URL (leading slash — ready for
 * `router.transitionTo`), or `undefined` when no entry matches.
 */
export function redirectTargetFor(
  router: RouterService,
  destination: RouteInfo,
  redirects: { from: string; to: string }[]
): string | undefined {
  if (redirects.length === 0) return undefined;

  // root → leaf, collecting every dynamic segment in order — urlFor
  // needs them positionally
  const chain: RouteInfo[] = [];

  for (let info: RouteInfo | null = destination; info; info = info.parent) {
    chain.unshift(info);
  }

  const params: string[] = [];

  for (const info of chain) {
    for (const name of info.paramNames) {
      const value = info.params?.[name];

      // URL-derived params are strings; a model object (from a
      // transitionTo with models) has no URL representation here — the
      // resulting URL just won't match any redirect
      params.push(typeof value === 'string' ? value : '');
    }
  }

  let url;

  try {
    url = router.urlFor(destination.name, ...params);
  } catch {
    // intermediate destinations (loading / error substates) have no URL
    return undefined;
  }

  // urlFor includes the rootURL; redirects are written app-relative
  const base = router.rootURL ?? '/';
  const visited = base === '/' ? url : '/' + url.slice(base.length).replace(/^\/+/, '');

  const target = resolveRedirect(visited.replace(/^\//, ''), redirects);

  return target === undefined ? undefined : '/' + target;
}
