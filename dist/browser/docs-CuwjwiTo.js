import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import { Shadowed } from 'ember-primitives/components/shadowed';
import { createStore } from 'ember-primitives/store';
import { setupCompiler } from 'ember-repl';
import { d as compileText, e as getKey, t as typedocLoader, H as HelperSignature, M as ModifierSignature, c as ComponentSignature, C as CommentQuery, A as APIDocs } from './modifier-Ctl1mPnl.js';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { getOwner } from '@ember/owner';
import { use } from 'ember-resources';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { keepLatest } from 'reactiveweb/keep-latest';
import { g, i, n } from 'decorator-transforms/runtime';

function selected(context) {
  const owner = getKey();
  return createStore(owner, Selected);
}
const CACHE = new Map();

/**
 * With .gjs.md and .gts.md documents, we have only one promise to deal with.
 * With .md documents, we have two promises.
 *
 * .gjs.md / .gts.md:
 *  1. the request to get the module
 *
 * .md
 *  1. the request to get the module
 *  2. compile
 */
function loaderFor(selected, path) {
  if (!path) return;
  const existing = CACHE.get(path);
  if (existing) return existing;
  const docs = selected.compiledDocs;
  const owner = getOwner(selected);

  /**
   * NOTE: we support paths with and withouth the '.md' on the URL
   */
  const fn = docs[path] ?? docs[path + '.md'];
  async function wrapper() {
    if (!fn) return;
    assert(`[Bug] Owner is missing`, owner);
    const module = await fn();
    if (typeof module.default === 'string') {
      const state = compileText(owner, module.default);
      return state.promise;
    }
    return module.default;
  }
  const wrapped = getPromiseState(wrapper);
  CACHE.set(path, wrapped);
  return wrapped;
}
class Selected {
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  compiledDocs = {};
  get #docs() {
    return docsManager();
  }
  get #loader() {
    return loaderFor(this, this.#matchOrFirstPagePath);
  }

  /*********************************************************************
   * This is a pattern to help reduce flashes of content during
   * the intermediate states of the above request fetchers.
   * When a new request starts, we'll hold on the old value for as long as
   * we can, and only swap out the old data when the new data is done loading.
   *
   ********************************************************************/
  static {
    g(this.prototype, "activeCompiled", [use], function () {
      return keepLatest({
        value: () => this.#loader,
        when: () => Boolean(this.#loader?.isLoading)
      });
    });
  }
  #activeCompiled = (i(this, "activeCompiled"), void 0);
  get prose() {
    if (this.error) {
      return;
    }
    return this.activeCompiled?.resolved;
  }
  get isReady() {
    return Boolean(this.activeCompiled?.resolved);
  }
  get isPending() {
    return !this.isReady;
  }
  get hasError() {
    if (this.error) {
      return Boolean(this.error);
    }
    return Boolean(this.activeCompiled?.error);
  }
  get error() {
    if (!this.#page) {
      const message = `Page not found for path "${this.#path}". (Using group: "${this.#docs.currentGroup.name}", see console for more information)`;
      this.#printError(message);
      return message;
    }
    const error = this.activeCompiled?.error ? String(this.activeCompiled?.error) : '';
    if (!error) return '';
    this.#printError(`An error occurred`, error);
    return error;
  }
  static {
    n(this.prototype, "error", [cached]);
  }
  get hasProse() {
    return Boolean(this.prose);
  }
  get #path() {
    if (!this.router.currentURL) return;
    const url = new URL(this.router.currentURL, window.location.origin);
    const path = url.pathname;
    if (path === '/') {
      return;
    }
    return path?.replace(/\.md$/, '');
  }
  get #matchOrFirstPagePath() {
    return this.#page?.path ?? this.#docs.pages[0]?.path;
  }
  #pageCache = createCache(() => {
    if (!this.#path) return;
    return this.#docs.findByPath(this.#path);
  });
  get #page() {
    return getValue(this.#pageCache);
  }
  #printError(message, error) {
    console.group(message);
    if (error) {
      console.error(error);
    }
    console.group('manifest');
    console.info(this.#docs.manifest);
    console.groupEnd();
    console.group('pages');
    console.info(this.#docs.pages);
    console.groupEnd();
    console.groupEnd();
  }
}

function docsManager(context) {
  const owner = getKey();
  return createStore(owner, DocsService);
}
const PREPARE_DOCS = Symbol('__KOLAY__PREPARE_DOCS__');
function compilerOptions({
  topLevelScope,
  remarkPlugins,
  rehypePlugins,
  modules
} = {}) {
  const md = {
    remarkPlugins,
    rehypePlugins
  };
  const scope = {
    ...topLevelScope,
    Shadowed,
    APIDocs,
    CommentQuery,
    ComponentSignature,
    ModifierSignature,
    HelperSignature
  };
  return {
    options: {
      md,
      gmd: {
        scope,
        ...md
      },
      hbs: {
        scope
      }
    },
    modules: {
      kolay: () => import('./index.js'),
      'kolay/components': () => import('./components.js'),
      'kolay/typedoc': () => import('./typedoc/index.js'),
      ...modules
    }
  };
}
class DocsService {
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  get apiDocs() {
    return typedocLoader();
  }
  get #selected() {
    return selected();
  }
  loadManifest = () => Promise.resolve({
    groups: []
  });
  setup = async options => {
    const [apiDocs, compiledDocs] = await Promise.all([options.apiDocs, options.compiledDocs]);
    this[PREPARE_DOCS](apiDocs, compiledDocs);
    const optionsForCompiler = compilerOptions({
      topLevelScope: options.topLevelScope,
      remarkPlugins: options.remarkPlugins ?? [],
      rehypePlugins: options.rehypePlugins ?? [],
      modules: options.modules
    });
    setupCompiler(this, optionsForCompiler);

    // type-narrowed version of _docs, above
    return this.manifest;
  };
  [PREPARE_DOCS](apiDocs, compiledDocs) {
    if (apiDocs) {
      this.apiDocs._packages = apiDocs.packageNames;
      this.apiDocs.loadApiDocs = apiDocs.loadApiDocs;
    }
    if (compiledDocs?.pages) {
      this.#selected.compiledDocs = compiledDocs.pages;
    }
    if (compiledDocs?.manifest) {
      this._docs = compiledDocs.manifest;
    }
  }
  get docs() {
    assert(`Docs' manifest was not loaded. Be sure to call setup() before accessing anything on the docs service.`, this._docs);
    return this._docs;
  }
  get manifest() {
    return this.docs;
  }

  /**
   * The flat list of all pages for the current group.
   * Each page knows the name of its immediate parent.
   */
  get pages() {
    return this.currentGroup?.list ?? [];
  }

  /**
   * The full page hierachy for the current group.
   */
  get tree() {
    return this.currentGroup?.tree ?? {};
  }

  /**
   * We use the URL for denoting which group we're looking at.
   * The first segment of the URL will either be a group,
   * or part of the path segment on the root namespace.
   *
   * This does open us up for collisions, so maybe
   * we'll need to alias "root" with something, or at
   * the very least not use a non-path segement for it.
   */
  get selectedGroup() {
    const [, /* leading slash */first] = this.router.currentURL?.split('/') || [];
    if (!first) return this.availableGroups[0];
    if (!this.availableGroups.includes(first)) return this.availableGroups[0];
    return first;
  }
  selectGroup = group => {
    assert(`Expected group name, ${group}, to be one of ${this.availableGroups.join(', ')}`, this.availableGroups.includes(group));
    if (group === 'root') {
      this.router.transitionTo('/');
      return;
    }
    this.router.transitionTo(`/${group}`);
  };
  get availableGroups() {
    const groups = this.manifest?.groups ?? [];
    return groups.map(group => group.name);
  }
  get currentGroup() {
    return this.groupFor(this.selectedGroup);
  }
  static {
    n(this.prototype, "currentGroup", [cached]);
  }
  groupFor = groupName => {
    const groups = this.manifest?.groups ?? [];
    const group = groups.find(group => group.name === groupName);
    assert(`Could not find group in manifest under the name ${groupName}. The available groups are: ${groups.map(group => group.name).join(', ')}`, group);
    return group;
  };

  /**
   * Will return false if a url doesn't exist in any group,
   * or the name of the group that contains the page if the url does exist.
   */
  groupForURL = url => {
    for (const groupName of this.availableGroups) {
      const group = this.groupFor(groupName);
      const page = group.list.find(page => page.path === url);
      if (page) {
        return groupName;
      }
    }
    return false;
  };

  /**
   * Returns the page entry for the current group
   */
  findByPath = path => {
    return this.pages.find(page => page.path === path || page.path === path + '.md');
  };
}

export { PREPARE_DOCS as P, compilerOptions as c, docsManager as d, selected as s };
//# sourceMappingURL=docs-CuwjwiTo.js.map
