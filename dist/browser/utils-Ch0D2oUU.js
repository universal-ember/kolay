import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import { Shadowed } from 'ember-primitives/components/shadowed';
import { createStore } from 'ember-primitives/store';
import { setupCompiler } from 'ember-repl';
import { visit } from 'unist-util-visit';
import { g as getKey, c as compileText, t as typedocLoader, H as HelperSignature, M as ModifierSignature, b as ComponentSignature, C as CommentQuery, A as APIDocs } from './modifier-B5bTsLNB.js';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { getOwner } from '@ember/owner';
import { waitForPromise } from '@ember/test-waiters';
import { use } from 'ember-resources';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { keepLatest } from 'reactiveweb/keep-latest';
import { g, i, n } from 'decorator-transforms/runtime';

/**
 * Remark plugin that rebases root-absolute URLs in authored markdown onto the
 * given prefix, so they keep working when the app is served at a non-root
 * rootURL. Handles link/image/definition mdast nodes as well as `href`/`src`
 * attributes in raw inline HTML.
 *
 * Kolay prepends this to both of its markdown pipelines automatically (the
 * in-browser compiler for `.md` and the build-time compiler for `.gjs.md`).
 * It must run while links are still mdast nodes; this also keeps code blocks
 * untouched. Exported for consumers with custom compile pipelines.
 *
 * This module is plain JS so the node-side build plugins can import it
 * directly; the browser re-exports it from `kolay`.
 *
 * @param {string | (() => string)} prefix - the app's rootURL, with or
 *   without a trailing slash. The build plugins pass a getter because the
 *   base URL is only known after their compiler is constructed.
 */
function rebaseAuthoredLinks(prefix) {
  return function remarkRebaseAuthoredLinks() {
    // A static prefix of '/' can skip transforming entirely by returning no
    // transformer; getter prefixes resolve at transform time.
    if (typeof prefix === 'string' && !normalizePrefix(prefix)) return;

    /**
     * @param {{ type: string, url?: unknown, value?: unknown }} tree
     */
    return tree => {
      const base = normalizePrefix(typeof prefix === 'function' ? prefix() : prefix);
      if (!base) return;

      // `any` keeps @types/unist out of the public declarations
      visit(/** @type {any} */tree, ['link', 'image', 'definition', 'html'], node => {
        if (node.type === 'html') {
          if (typeof node.value === 'string') {
            node.value = rebaseHtml(node.value, base);
          }
          return;
        }
        if (typeof node.url === 'string') {
          node.url = rebaseUrl(node.url, base);
        }
      });
    };
  };
}

/**
 * @param {string} prefix
 */
function normalizePrefix(prefix) {
  return prefix.replace(/\/$/, '');
}

/**
 * @param {string} url
 * @param {string} base - normalized, no trailing slash
 */
function rebaseUrl(url, base) {
  // only root-absolute paths; '//host/...' is protocol-relative
  if (!url.startsWith('/') || url.startsWith('//')) return url;

  // already prefixed (idempotent — safe if a consumer's own rebase plugin or
  // a pre-prefixed authored URL shows up). Caveat: an authored path whose
  // first segment coincidentally equals the rootURL's segment is
  // indistinguishable from an already-rebased one and is left alone.
  if (url === base || url.startsWith(base + '/')) return url;
  return base + url;
}

/**
 * Rebase root-absolute `href`/`src` attribute values in a raw HTML string.
 *
 * @param {string} html
 * @param {string} base - normalized, no trailing slash
 */
function rebaseHtml(html, base) {
  return html.replace(/(\s(?:href|src)\s*=\s*)(["'])(\/[^"']*)\2/gi, (_match, attr, quote, url) => attr + quote + rebaseUrl(url, base) + quote);
}

/**
 * Extracts a human-readable error message string from an unknown value.
 *
 * - `Error` instances → `.message`
 * - string values → passed through directly
 * - anything else → `''`
 */
function extractErrorMessage(rawError) {
  if (rawError instanceof Error) return rawError.message;
  if (typeof rawError === 'string') return rawError;
  return '';
}

function selected(context) {
  const owner = getKey();
  return createStore(owner, Selected);
}
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
  const docs = selected.compiledDocs;
  const owner = getOwner(selected);

  /**
   * NOTE: we support paths with and withouth the '.md' on the URL
   */
  const fn = docs[path] ?? docs[path + '.md'];
  async function load() {
    assert(`[Bug] Owner is missing`, owner);
    assert(`Invalid path: ${path}. No loader found.`, fn);
    const module = await fn();
    if (typeof module.default === 'string') {
      const state = compileText(owner, module.default);
      return state.promise;
    }
    return module.default;
  }
  async function wrapper() {
    if (!fn) return;

    // Holds `settled()` (visit/click in tests) open for the module fetch and
    // compile, so tests never see a partially-rendered page. No-op in
    // production builds.
    return waitForPromise(load());
  }
  const wrapped = getPromiseState(wrapper);
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
  get loader() {
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
    n(this.prototype, "loader", [cached]);
  }
  static {
    g(this.prototype, "activeCompiled", [use], function () {
      return keepLatest({
        value: () => this.loader,
        when: () => Boolean(this.loader?.isLoading)
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
    const rawError = this.activeCompiled?.error;
    const error = extractErrorMessage(rawError);
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

    // currentURL is app-relative — Ember's location layer already stripped
    // the rootURL — so use its pathname verbatim.
    const url = new URL(this.router.currentURL, window.location.origin);
    const path = url.pathname;
    if (path === '/') {
      return;
    }
    return path.replace(/\.md$/, '');
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
  rootURL = '/',
  topLevelScope,
  remarkPlugins,
  rehypePlugins,
  modules
} = {}) {
  const md = {
    // Prepended so authored root-absolute URLs are rebased onto the rootURL
    // before any consumer plugin serializes mdast nodes to raw HTML. Living
    // here (not in setup()) means every compiler built from these options —
    // including the test-support one — gets the same behavior.
    remarkPlugins: [rebaseAuthoredLinks(rootURL), ...(remarkPlugins ?? [])],
    rehypePlugins
  };
  const scope = {
    Shadowed,
    APIDocs,
    CommentQuery,
    ComponentSignature,
    ModifierSignature,
    HelperSignature,
    ...topLevelScope
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
    base: '/',
    groups: []
  });
  setup = async options => {
    const [apiDocs, compiledDocs] = await Promise.all([options.apiDocs, options.compiledDocs]);
    this[PREPARE_DOCS](apiDocs, compiledDocs);
    const optionsForCompiler = compilerOptions({
      rootURL: this.router.rootURL,
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
    // currentURL is app-relative (Ember's location layer already stripped
    // the rootURL), but it can carry query params — drop them before
    // segmenting.
    const [path = ''] = this.router.currentURL?.split(/[?#]/) ?? [];
    const [, /* leading slash */first] = path.split('/');
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
      const page = group.list.find(page => page.appRelativePath === url);
      if (page) {
        return groupName;
      }
    }
    return false;
  };

  /**
   * Returns the page entry for the current group.
   * Takes an app-relative path (the space `router.currentURL` is in),
   * with or without the `.md` extension.
   */
  findByPath = path => {
    return this.pages.find(page => page.appRelativePath === path || page.appRelativePath === path + '.md');
  };
}

function isCollection(x) {
  return 'pages' in x;
}
function isIndex(x) {
  if (isCollection(x)) return false;
  return x.path.endsWith('index');
}
function getIndexPage(x) {
  const page = x.pages.find(isIndex);
  if (page && isCollection(page)) return;
  return page;
}

/////////////////////////////////
// copied from ember-primitives
// should these be exposed?
/////////////////////////////////

/**
 * Loose check for an "ownerish" API.
 * only the ".lookup" method is required.
 *
 * The requirements for what an "owner" is are sort of undefined,
 * as the actual owner in ember applications has too much on it,
 * and the long term purpose of the owner will be questioned once we
 * eliminate the need to have a registry (what lookup looks in to),
 * but we'll still need "Something" to represent the lifetime of the application.
 *
 * Technically, the owner could be any object, including `{}`
 */
function isOwner(x) {
  if (!isNonNullableObject(x)) return false;
  return 'lookup' in x && typeof x.lookup === 'function';
}
function isNonNullableObject(x) {
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  return true;
}

/**
 * Can receive the class instance or the owner itself, and will always return return the owner.
 *
 * undefined will be returned if the Owner does not exist on the passed object
 *
 * Can be useful when combined with `createStore` to then create "services",
 * which don't require string lookup.
 */
function findOwner(contextOrOwner) {
  if (isOwner(contextOrOwner)) return contextOrOwner;

  // _ENSURE_ that we have an object, else getOwner makes no sense to call
  if (!isNonNullableObject(contextOrOwner)) return;
  const maybeOwner = getOwner(contextOrOwner);
  if (isOwner(maybeOwner)) return maybeOwner;
  return;
}
function forceFindOwner(contextOrOwner) {
  const maybe = findOwner(contextOrOwner);
  assert(`Did not find owner. An owner is required`, maybe);
  return maybe;
}
class LRUCache {
  #max;
  #map = new Map();
  #head = {};
  #tail = {};
  constructor(max = 128) {
    this.#max = max;
    this.#head.next = this.#tail;
    this.#tail.prev = this.#head;
  }
  get(key) {
    const node = this.#map.get(key);
    if (!node) return undefined;
    this.#remove(node);
    this.#insertAfterHead(node);
    return node.value;
  }
  set(key, value) {
    if (this.#map.has(key)) return;
    const node = {
      key,
      value
    };
    this.#map.set(key, node);
    this.#insertAfterHead(node);
    if (this.#map.size > this.#max) {
      this.#map.delete(this.#tail.prev.key);
      this.#remove(this.#tail.prev);
    }
  }
  #remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  #insertAfterHead(node) {
    node.next = this.#head.next;
    node.prev = this.#head;
    this.#head.next.prev = node;
    this.#head.next = node;
  }
}
new LRUCache();

export { PREPARE_DOCS as P, isCollection as a, compilerOptions as c, docsManager as d, forceFindOwner as f, getIndexPage as g, isIndex as i, selected as s };
//# sourceMappingURL=utils-Ch0D2oUU.js.map
