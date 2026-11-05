import { registerDestructor } from '@ember/destroyable';

import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';

interface Resolvers {
  /** Where the given transition should go instead, if anywhere. */
  fromTransition: (transition: Transition) => string | undefined;
  /** Where the URL the app arrived on should go instead, if anywhere. */
  onArrival: () => string | undefined;
}

/**
 * Serves a redirect on every transition, and on the URL the app boots at.
 *
 * The arrival half is not redundant: setup runs inside the application route's
 * model hook, during the initial transition, whose `routeWillChange` has
 * already fired. `replaceWith`, because the URL being corrected is already in
 * the history.
 *
 * Both kinds of redirect (authored, and page-tree) wire up this way, so the
 * order they call this in decides which one wins a URL both could claim.
 */
export function wireRedirects(
  context: object,
  router: RouterService,
  { fromTransition, onArrival }: Resolvers
): void {
  const onRouteWillChange = (transition: Transition) => {
    const target = fromTransition(transition);

    if (target !== undefined) router.transitionTo(target);
  };

  router.on('routeWillChange', onRouteWillChange);
  registerDestructor(context, () => router.off('routeWillChange', onRouteWillChange));

  const checkArrival = () => {
    const target = onArrival();

    if (target !== undefined) router.replaceWith(target);
  };

  if (router.currentURL) {
    checkArrival();
  } else {
    // self-removing; the router can't outlive this store (same owner)
    router.one('routeDidChange', checkArrival);
  }
}
