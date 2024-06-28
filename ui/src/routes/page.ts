import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type Docs from '../services/kolay/docs.ts';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';

interface WithIntent {
  intent: {
    url: string;
  }
}

/**
 * This route is provided by Kolay.
 * It is responsible for stopping folks from navigating to
 * pages that don't exist.
 *
 * NOTE that all routes under the this route *must* exist in the manifest.
 */
export default class KolayPageRoute extends Route {
  @service('kolay/docs') declare docs: Docs;
  @service declare router: RouterService;

    /**
     * Does the page exist?
     * - no: redirect to 'application'
     * - yes: do nothing
     */
  beforeModel(transition: Transition) {
    /**
     * NOTE: intent is private, but people use it, as there is
     *       interest in making it public (though the routing
     *       layer is about to be rewritten entirely)
     */
    let { intent } = transition as unknown as WithIntent;
    let attempttedURL = intent.url;

    let page = this.docs.pages.find(page => page.path === attempttedURL);

    if (!page) {
      /**
       * TODO: make this configurable via the "setup" hook
       *       in the user's application route.
       */
      return this.router.replaceWith('application');
    }
  }

  /**
  * Load the page for the compiler
  */
  model(path, transition) {
    console.log({ path, transition });
  }
}
