import Service, { service } from '@ember/service';

import { use } from 'ember-resources';
import { keepLatest } from 'reactiveweb/keep-latest';
import { link } from 'reactiveweb/link';
import { RemoteData } from 'reactiveweb/remote-data';

import { Compiled } from './compiler/reactive.ts';

import type CompilerService from './compiler';
import type DocsService from './docs';
import type { Page } from './types';
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

/**
 * Like an ember-concurrency task,
 * if we ignore concurrency and only care about the states
 * (and want automatic invocation based on derivation)
 */
class MDRequest {
  constructor(private urlFn: () => string) {}

  @use last = RemoteData<string>(this.urlFn);

  get hasError() {
    return Boolean(this.last.status?.toString().match(/^[54]/));
  }

  @use lastSuccessful = keepLatest({
    value: () => this.last.value,
    when: () => this.hasError,
  });
}

class Prose {
  constructor(private docFn: () => ( string | null )) {}

  @use last = Compiled(this.docFn);

  @use lastSuccessful = keepLatest({
    value: () => this.last.component,
    when: () => !this.last.isReady
  });
}

export default class Selected extends Service {
  @service declare router: RouterService;
  @service('kolay/docs') declare docs: DocsService;
  @service('kolay/compiler') declare compiler: CompilerService;

  /*********************************************************************
   * These load the files from /public and handle loading / error state.
   *
   * When the path changes for each of these, the previous request will
   * be cancelled if it was still pending.
   *******************************************************************/

  @link request = new MDRequest(() => `/docs${this.path}.md`)
  @link compiled = new Prose(() => this.request.lastSuccessful)

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

  get hasError() {
    return Boolean(this.proseCompiled.error) || this.request.hasError ;
  }
  get error() {
    return String(this.proseCompiled.error);
  }

  get hasProse() {
    return Boolean(this.prose);
  }

  get path(): string | undefined {
    if (!this.router.currentURL) return firstPath;

    let [path] = this.router.currentURL.split('?');
    let result = path && path !== '/' ? path : firstPath;

    return result?.replace(/\.md$/, '');
  }

  get page(): Page | undefined {
    if (!this.path) return;

    return this.#findByPath(this.path);
  }

  #findByPath = (path: string) => {
    return this.docs.pages.find((page) => page.path === `${path}.md`);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    selected: Selected;
  }
}
