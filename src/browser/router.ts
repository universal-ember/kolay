import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';

import { docsManager } from './services/docs.ts';

import type { RouterDSL } from '@ember/-internals/routing';
import type Transition from '@ember/routing/transition';

/**
 * Adds the wildcard docs route.
 *
 * May be called at the top level of the router map (all groups are served
 * from the root URL space), or inside nested routes to mount groups as
 * their own routes — once per mount, one mount per group, where each
 * mount's path is its group's name:
 *
 * ```js
 * Router.map(function () {
 *   this.route('guides', function () {
 *     addRoutes(this);
 *   });
 *   this.route('api', function () {
 *     addRoutes(this);
 *   });
 * });
 * ```
 */
export function addRoutes(context: Pick<RouterDSL, 'route'>): void {
  /**
   * We need a level of nesting for every `/` in the URL so that we don't over-refresh / render the whole page
   */
  context.route('page', { path: '/*page' }, function () {});
}

/**
 * Does our target destination exist? if not,
 * redirect to the first page on the namespace
 *
 * For use with addRoutes(), which defines a "page" path matcher
 */
export function handlePotentialIndexVisit(context: object, transition: Transition) {
  const docs = docsManager(context);

  if (transition.to?.localName !== 'index') return;

  const parent = transition.to.parent;

  /**
   * With a top-level addRoutes() mount, visiting `/GroupName` lands on
   * `page.index` with the group name as the wildcard segment.
   *
   * With a nested mount (`this.route('guides', function () { addRoutes(this) })`),
   * visiting `/guides` lands on the mount route's own index, so the mount
   * route's name is the group name.
   *
   * Visiting the app's root (`/`) lands on the top-level `index` route —
   * there is no group in the URL, so the default (first) group is used.
   */
  const candidates =
    transition.to.name === 'index'
      ? [docs.availableGroups[0]]
      : [parent?.params?.page, parent?.localName];

  const groupName = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && docs.availableGroups.includes(candidate)
  );

  if (!groupName) return;

  const group = docs.groupFor(groupName);

  const first = group.list[0];

  if (!first) {
    console.warn(`Could not determine first page in group: ${groupName}`);

    return;
  }

  const router = getOwner(context)?.lookup('service:router');

  assert(`Expected to find the router service, but did not`, router);

  // `transitionTo` prepends the rootURL itself, so use the app-relative path
  // (`first.path` includes the rootURL and would double the prefix).
  router.transitionTo(first.appRelativePath);
}
