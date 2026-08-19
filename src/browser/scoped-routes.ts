import { trimSlashes } from '../paths.js';

import type RouteInfo from '@ember/routing/route-info';
import type { RouteInfoWithAttributes } from '@ember/routing/route-info';

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

export interface MountLocation {
  /** The wildcard segment below the mount, trailing slashes stripped. */
  wildcardParam: string | undefined;
  /**
   * Names that may identify the group this mount serves, most specific
   * first. Raw — canonicalize at the callsite, which has the docs service.
   */
  mountGroupNames: string[];
}

/**
 * Where an index arrival sits relative to its mount.
 *
 * Index routes are reached two ways, and the parent differs: at the mount's
 * own URL (`/guides`) the parent is the mount route and the wildcard is its
 * sibling, while below it (`/guides/foo`) the parent is the wildcard route.
 * Both shapes resolve here so that callers don't each carry a copy of the
 * topology.
 */
export function mountLocationFor(
  to: RouteInfo | RouteInfoWithAttributes | null | undefined
): MountLocation {
  const parent = to?.parent;
  const raw = parent?.params?.['page'];
  const atWildcard = typeof raw === 'string';
  const wildcardParam = atWildcard ? trimSlashes(raw, { leading: false }) || undefined : undefined;

  const names = parent
    ? atWildcard
      ? [groupNameForRoute(parent.name), parent.parent?.localName]
      : [groupNameForRoute(scopedRouteNameFor(parent.name)), parent.localName]
    : [];

  return {
    wildcardParam,
    // `application` is ember's root route, never a mount, so it names no group.
    mountGroupNames: names.filter(
      (name): name is string => typeof name === 'string' && name !== 'application'
    ),
  };
}

/**
 * The index route alongside the given wildcard route —
 * i.e. the mount's own URL.
 */
export function indexRouteNameFor(mountRouteName: string): string {
  return mountRouteName === 'page' ? 'index' : mountRouteName.replace(/\.page$/, '.index');
}
