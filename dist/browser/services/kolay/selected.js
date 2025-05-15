
import { getOwner } from '@ember/owner';
import Service, { service } from '@ember/service';
import { use } from 'ember-resources';
import { keepLatest } from 'reactiveweb/keep-latest';
import { link } from 'reactiveweb/link';
import { Compiled } from './compiler/reactive';
import { MDRequest } from './request';
import { g, i } from 'decorator-transforms/runtime';

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
 * Sort of like an ember-concurrency task...
 * if we ignore concurrency and only care about the states of the running function
 * (and want automatic invocation based on derivation)
 */
class Prose {
  constructor(docFn) {
    this.docFn = docFn;
  }
  static {
    g(this.prototype, "last", [use], function () {
      return Compiled(() => this.docFn());
    });
  }
  #last = (i(this, "last"), void 0);
  static {
    g(this.prototype, "lastSuccessful", [use], function () {
      return keepLatest({
        value: () => this.last.component,
        when: () => !this.last.isReady
      });
    });
  }
  #lastSuccessful = (i(this, "lastSuccessful"), void 0);
}
class Selected extends Service {
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  static {
    g(this.prototype, "docs", [service('kolay/docs')]);
  }
  #docs = (i(this, "docs"), void 0);
  get rootURL() {
    return getOwner(this).router.rootURL;
  }

  /*********************************************************************
   * These load the files from /public and handle loading / error state.
   *
   * When the path changes for each of these, the previous request will
   * be cancelled if it was still pending.
   *******************************************************************/
  static {
    g(this.prototype, "request", [link], function () {
      return new MDRequest(() => `${this.rootURL}docs${this.path}.md`);
    });
  }
  #request = (i(this, "request"), void 0);
  static {
    g(this.prototype, "compiled", [link], function () {
      return new Prose(() => this.request.lastSuccessful);
    });
  }
  #compiled = (i(this, "compiled"), void 0);
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
      return `Page not found for path ${this.path}. (Using group: ${this.docs.currentGroup.name})`;
    }
    return String(this.proseCompiled.error);
  }
  get hasProse() {
    return Boolean(this.prose);
  }
  get path() {
    if (!this.router.currentURL) return firstPath;
    const url = new URL(this.router.currentURL, window.location.origin);
    const path = url.pathname;
    const result = path && path !== '/' ? path : firstPath;
    return result?.replace(/\.md$/, '');
  }
  get page() {
    if (!this.path) return;
    return this.#findByPath(this.path);
  }
  #findByPath = path => {
    return this.docs.pages.find(page => page.path === `${path}.md`);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.

export { Selected as default };
//# sourceMappingURL=selected.js.map
