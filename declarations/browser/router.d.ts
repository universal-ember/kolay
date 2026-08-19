import type { RouterDSL } from '@ember/-internals/routing';
import type Transition from '@ember/routing/transition';
/**
 * Adds the wildcard docs route.
 *
 * The primary way to mount a group is through its virtual module —
 * `docs('foo')` enables `virtual:kolay/docs/foo`, whose `addRoutes` is
 * this function, pre-scoped to the group:
 *
 * ```js
 * import { addRoutes as addFooRoutes } from 'virtual:kolay/docs/foo';
 *
 * Router.map(function () {
 *   this.route('help', function () {
 *     addFooRoutes(this);
 *   });
 * });
 * ```
 *
 * Directly, it may be called at the top level of the router map (all
 * groups are served from the root URL space), or inside nested routes to
 * mount groups as their own routes — once per mount:
 *
 * ```js
 * Router.map(function () {
 *   this.route('guides', function () {
 *     addRoutes(this);
 *   });
 * });
 * ```
 *
 * Without a group name, a mount serves whichever group the URL names — so
 * a nested mount's path must match its group's name.
 *
 * With a group name, the mount is scoped: it serves that group's docs
 * regardless of the mount's own path —
 * `addRoutes(this, 'foo-bar')` brings all of the docs from the `foo-bar`
 * group into the route addRoutes was called from:
 *
 * ```js
 * Router.map(function () {
 *   this.route('help', function () {
 *     addRoutes(this, 'foo-bar'); // /help/... serves the foo-bar group
 *   });
 * });
 * ```
 *
 * (One mount per route: addRoutes always creates a route named `page`,
 *  so two mounts need two different surrounding routes.)
 */
export declare function addRoutes(context: Pick<RouterDSL, 'route'> & {
    parent?: string | null;
}, groupName?: string): void;
/**
 * Does our target destination exist? if not,
 * redirect to the first page on the namespace
 *
 * For use with addRoutes(), which defines a "page" path matcher
 */
export declare function handlePotentialIndexVisit(context: object, transition: Transition): void;
//# sourceMappingURL=router.d.ts.map