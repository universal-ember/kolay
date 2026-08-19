/**
 * The full name of the wildcard route `addRoutes` creates, given the
 * surrounding route's full name (the DSL's `parent`).
 *
 * At the top of the router map, ember's DSL reports `parent` as
 * 'application', which its own getFullName treats as "no prefix" —
 * mirror that, or a top-level scoped mount would register as
 * 'application.page' while the real route is 'page'.
 */
export declare function scopedRouteNameFor(parent: string | null | undefined): string;
export declare function registerScopedRoute(routeName: string, groupName: string): void;
/**
 * The group bound to the given wildcard route, if any.
 */
export declare function groupNameForRoute(routeName: string): string | undefined;
/**
 * The wildcard route the given group is mounted at, if any.
 */
export declare function routeNameForGroup(groupName: string): string | undefined;
/**
 * The index route alongside the given wildcard route —
 * i.e. the mount's own URL.
 */
export declare function indexRouteNameFor(mountRouteName: string): string;
//# sourceMappingURL=scoped-routes.d.ts.map