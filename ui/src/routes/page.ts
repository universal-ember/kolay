import { assert } from '@ember/debug';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type Docs from '../services/kolay/docs.ts';
import type Selected from '../services/kolay/selected.ts';
import type RouterService from '@ember/routing/router-service';

/**
 * This route is provided by Kolay.
 * It is responsible for stopping folks from navigating to
 * pages that don't exist.
 *
 * NOTE that all routes under the this route *must* exist in the manifest.
 *
 * This whole Route is hacks on what would otherwise be derived data.
 * *however* -- Ember is not set up to route ergonomically with derived data patterns.
 */
export default class KolayPageRoute extends Route {
  @service('kolay/docs') declare docs: Docs;
  @service('kolay/selected') declare selected: Selected;
  @service declare router: RouterService;

  /**
   * Load the page for the compiler (if it exists)
   *
   * This relies on the browser's built in cache.
   * If the page is already fetched, we don't hit the network again when we try to render it (even if we use fetch to ask for the page)
   */
  async model({ page }: { page: string }) {
    /* does not contain leading slash, but does have .md */
    let visitedPath = page;
    /**
     * page should have .md at the end already
     */
    let mdFilePath = `/docs/${visitedPath}`;

    let attemptedGroupName = this.docs.groupForPath(`/${visitedPath}`);
    let attemptedGroup = this.docs.groupFor(attemptedGroupName);
    let attemptedGroupPages = attemptedGroup?.list ?? [];
    // This removes query params (and also the md, which we need to add back)
    // NOTE: that we may be able to simplify a few things by not chopping off the .md
    //       extension
    let cleanedPath = this.selected.pathFromUrl(visitedPath);
    let foundPage = attemptedGroupPages.find(
      (page) => page.path === `/${cleanedPath}.md`,
    )?.path;

    if (!foundPage) {
      if (attemptedGroupName === cleanedPath) {
        foundPage = attemptedGroupPages[0]?.path;
        this.router.replaceWith(foundPage);

        return;
      }
    }

    /**
     * Were we trying to just get to the new group?
     */
    if (!foundPage) {
      assert(
        `on.pageNotFound must be a function. Did you pass the correct value in your 'setup' call?`,
        typeof this.docs._eventHandlers.pageNotFound === 'function',
      );
      this.docs._eventHandlers.pageNotFound(page, 'not in manifest');

      return;
    }

    let response = await fetch(mdFilePath);

    if (response.status >= 400) {
      assert(
        `on.pageNotFound must be a function. Did you pass the correct value in your 'setup' call?`,
        typeof this.docs._eventHandlers.pageNotFound === 'function',
      );
      this.docs._eventHandlers.pageNotFound(mdFilePath, '404 during fetch');

      return;
    }
  }
}
