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

export function registerScopedRoute(routeName: string, groupName: string): void {
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
