import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';

import { docsManager } from './services/docs.ts';

import type { RouterDSL } from '@ember/-internals/routing';
import type Transition from '@ember/routing/transition';

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

  const groupName = String(transition.to.parent?.params?.page);

  if (!groupName) return;
  if (!docs.availableGroups.includes(groupName)) return;

  const group = docs.groupFor(groupName);

  const first = group.list[0];

  if (!first) {
    console.warn(`Could not determine first page in group: ${groupName}`);

    return;
  }

  const router = getOwner(context)?.lookup('service:router');

  assert(`Expected to find the router service, but did not`, router);

  router.transitionTo(first.path);
}
