import { service } from '@ember/service';

import { createStore } from 'ember-primitives/store';

import { stripTrailingSlash } from '../../paths.js';
import { mountLocationFor } from '../scoped-routes.ts';
import { docsManager } from './docs.ts';
import { getKey } from './lazy-load.ts';
import { wireRedirects } from './redirect-wiring.ts';

import type { Page } from '../../types.ts';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';

export function pageTreeRedirects(context: unknown) {
  const owner = getKey(context);

  return createStore(owner, PageTreeRedirectService);
}

/**
 * Sends a URL that names a `PageTree` rather than a page — a folder, or a
 * group's own root — to the first page under it.
 *
 * On `routeWillChange`, not a route's `beforeModel`: a mount route has no
 * dynamic segment, so Ember doesn't re-enter it when only the wildcard's
 * param changes — and clicking an authored link (`properLinks` makes it an
 * in-app transition) is how readers arrive. No loop: the destination is a
 * page path, which `landingForPageTree` declines.
 */
export class PageTreeRedirectService {
  @service declare private router: RouterService;

  get #docs() {
    return docsManager(this);
  }

  #wired = false;

  setup = () => {
    if (this.#wired) return;

    this.#wired = true;

    wireRedirects(this, this.router, {
      fromTransition: (transition: Transition) => this.#hrefFor(transition.to),
      onArrival: () => this.#hrefFor(this.router.currentRoute),
    });
  };

  #hrefFor(to: Transition['to'] | RouterService['currentRoute']): string | undefined {
    const landing = this.#landingFor(to);

    return landing ? this.#docs.appRelativeHrefFor(landing) : undefined;
  }

  /**
   * `undefined` unless the URL names a `PageTree`. A page visit also resolves
   * to the wildcard's index, with the page as its param.
   */
  #landingFor(to: Transition['to'] | RouterService['currentRoute']): Page | undefined {
    if (to?.localName !== 'index') return;

    const docs = this.#docs;
    const { wildcardParam, mountGroupNames } = mountLocationFor(to);

    // Through `canonicalGroupName` because `addRoutes` stores whatever the app
    // author passed, unchecked. A top-level mount's candidates are the routes
    // above its wildcard, which name no group, so it falls through.
    const mountGroup = mountGroupNames
      .map((name) => docs.canonicalGroupName(name))
      .find((name) => name !== undefined);

    // The mount's own URL (`/guides`), which carries no wildcard to resolve:
    // the mount's group root is the destination. Ember does not re-enter a
    // mount route that is already active, so `handlePotentialIndexVisit` on it
    // only fires on the way in — a reader clicking the group's own nav link
    // from inside the mount would otherwise land on a blank index.
    if (!wildcardParam) {
      if (!mountGroup) return;

      return docs.landingForPageTree(docs.groupFor(mountGroup).tree.appRelativePath, mountGroup);
    }

    if (!mountGroup) return docs.landingForPageTree(`/${wildcardParam}`);

    // Not always the group's name: `Home`'s prefix is the root.
    const prefix = stripTrailingSlash(docs.groupFor(mountGroup).tree.appRelativePath);

    return docs.landingForPageTree(`${prefix}/${wildcardParam}`, mountGroup);
  }
}
