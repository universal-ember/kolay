import type Transition from '@ember/routing/transition';
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
export declare function resolveRedirect(path: string, redirects: {
    from: string;
    to: string;
}[]): string | undefined;
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
export declare function redirectTargetFor(transition: Transition, redirects: {
    from: string;
    to: string;
}[]): string | undefined;
//# sourceMappingURL=redirects.d.ts.map