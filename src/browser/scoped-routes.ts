/**
 * `addRoutes(context, groupName)` binds the wildcard route it creates to a
 * group — the mount then serves that group's docs regardless of the mount's
 * own path.
 *
 * The bindings are recorded here, at router-map time (there is no owner
 * yet), keyed by the wildcard route's full name (e.g. 'help.page', or
 * 'page' for a top-level mount). The docs service and nav components read
 * them to resolve pages and compute mount-space URLs.
 */
const scopedRouteGroups = new Map<string, string>();

/**
 * The full name of the wildcard route `addRoutes` creates, given the
 * surrounding route's full name (the DSL's `parent`).
 *
 * At the top of the router map, ember's DSL reports `parent` as
 * 'application', which its own getFullName treats as "no prefix" —
 * mirror that, or a top-level scoped mount would register as
 * 'application.page' while the real route is 'page'.
 */
export function scopedRouteNameFor(parent: string | null | undefined): string {
  const prefix = parent === 'application' ? null : parent;

  return prefix ? `${prefix}.page` : 'page';
}

/**
 * `addRoutes` adds one wildcard route to the route it is called from, so
 * two scoped mounts in the same route would both claim that one wildcard —
 * the second silently winning, leaving the first group unreachable. Refuse
 * it instead.
 *
 * A plain throw rather than `@ember/debug`'s `assert`: this module's unit
 * tests run in node, and a mount that never resolves is as broken in
 * production as it is in development.
 */
export function registerScopedRoute(routeName: string, groupName: string): void {
  const claimed = scopedRouteGroups.get(routeName);

  if (claimed !== undefined && claimed !== groupName) {
    throw new Error(
      `The '${routeName}' route already mounts the '${claimed}' group, so it cannot also ` +
        `mount '${groupName}'. addRoutes(context, groupName) adds one wildcard route to the ` +
        `route it is called from — give each mount its own route.`
    );
  }

  scopedRouteGroups.set(routeName, groupName);
}

/**
 * The group bound to the given wildcard route, if any.
 */
export function groupNameForRoute(routeName: string): string | undefined {
  return scopedRouteGroups.get(routeName);
}

/**
 * The wildcard route the given group is mounted at, if any.
 */
export function routeNameForGroup(groupName: string): string | undefined {
  for (const [routeName, group] of scopedRouteGroups) {
    if (group === groupName) return routeName;
  }

  return undefined;
}

/**
 * The index route alongside the given wildcard route —
 * i.e. the mount's own URL.
 */
export function indexRouteNameFor(mountRouteName: string): string {
  return mountRouteName === 'page' ? 'index' : mountRouteName.replace(/\.page$/, '.index');
}
