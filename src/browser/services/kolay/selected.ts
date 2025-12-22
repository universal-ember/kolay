import { getOwner } from '@ember/owner';
import { service } from '@ember/service';

import { createService } from 'ember-primitives/service';
import { use } from 'ember-resources';
import { keepLatest } from 'reactiveweb/keep-latest';
import { link } from 'reactiveweb/link';

import { Compiled } from './compiler/reactive.ts';
import { docsManager } from './docs.ts';
import { MDRequest } from './request.ts';

import type { Page } from '../../../types.ts';
import type ApplicationInstance from '@ember/application/instance';
import type RouterService from '@ember/routing/router-service';

/**
 * Populate a cache of all the documents.
 *
 * Network can be slow, and compilation is fast.
 * So after we get the requested page, let's get
 * everything else
 */
// const fillCache = (path: string) => {
//   fetch(`/docs/${path}`)
// };
//

const firstPath = '/1-get-started/intro.md';

export function selected(context: object) {
  return createService(context, Selected);
}

/**
 * Sort of like an ember-concurrency task...
 * if we ignore concurrency and only care about the states of the running function
 * (and want automatic invocation based on derivation)
 */
class Prose {
  constructor(private docFn: () => string | null) {}

  @use last = Compiled(() => this.docFn());

  @use lastSuccessful = keepLatest({
    value: () => this.last.component,
    when: () => !this.last.isReady,
  });
}

class Selected {
  @service declare router: RouterService;

  get #docs() {
    return docsManager(this);
  }

  get rootURL() {
    return (getOwner(this) as ApplicationInstance).router.rootURL;
  }

  /*********************************************************************
   * These load the files from /public and handle loading / error state.
   *
   * When the path changes for each of these, the previous request will
   * be cancelled if it was still pending.
   *******************************************************************/

  @link request = new MDRequest(() => `${this.rootURL}docs${this.path}.md`);
  @link compiled = new Prose(() => this.request.lastSuccessful);

  get proseCompiled() {
    return this.compiled.last;
  }

  /*********************************************************************
   * This is a pattern to help reduce flashes of content during
   * the intermediate states of the above request fetchers.
   * When a new request starts, we'll hold on the old value for as long as
   * we can, and only swap out the old data when the new data is done loading.
   *
   ********************************************************************/
  get prose() {
    return this.compiled.lastSuccessful;
  }

  /**
   * Once this whole thing is "true", we can start
   * rendering without extra flashes.
   */
  get isReady() {
    return this.proseCompiled.isReady;
  }

  get isPending() {
    return !this.isReady;
  }

  get hasError() {
    return Boolean(this.proseCompiled.error) || this.request.hasError;
  }
  get error() {
    if (!this.page) {
      return `Page not found for path ${this.path}. (Using group: ${this.#docs.currentGroup.name})`;
    }

    return String(this.proseCompiled.error);
  }

  get hasProse() {
    return Boolean(this.prose);
  }

  get path(): string | undefined {
    if (!this.router.currentURL) return firstPath;

    const url = new URL(this.router.currentURL, window.location.origin);
    const path = url.pathname;
    const result = path && path !== '/' ? path : firstPath;

    return result?.replace(/\.md$/, '');
  }

  get page(): Page | undefined {
    if (!this.path) return;

    return this.#findByPath(this.path);
  }

  #findByPath = (path: string) => {
    return this.#docs.pages.find((page) => page.path === `${path}.md`);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'kolay/selected': Selected;
  }
}
