import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';
import { Shadowed } from 'ember-primitives/components/shadowed';
import { createStore } from 'ember-primitives/store';
import { setupCompiler } from 'ember-repl';
import remarkFrontmatter from 'remark-frontmatter';
import { visit } from 'unist-util-visit';
import { getOwner } from '@ember/owner';
import { g as getKey, c as compileText, t as typedocLoader, H as HelperSignature, M as ModifierSignature, b as ComponentSignature, C as CommentQuery, A as APIDocs } from './modifier-BQmws-Aa.js';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { waitForPromise } from '@ember/test-waiters';
import { getPromiseState } from 'reactiveweb/get-promise-state';
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
 * The co-located pages' group (app/templates, src/templates), as the build
 * names it (`displayName` in build/plugins/setup.js's `homeSource`). Its
 * pages live in the root URL space rather than under the group's name, so
 * its nav link is the app's root.
 */
const HOME_GROUP = 'Home';
function isPageTree(x) {
  return 'pages' in x;
}
function isIndex(x) {
  if (isPageTree(x)) return false;
  return x.path.replace(/\.md$/, '').endsWith('index');
}
function getIndexPage(x) {
  const page = x.pages.find(isIndex);
  if (page && isPageTree(page)) return;
  return page;
}

/**
 * URLs are conventionally case-insensitive; path/route matching in this
 * library follows that convention rather than treating paths as opaque,
 * case-sensitive strings.
 */
function equalsIgnoreCase(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Whether two paths name the same page: paths with and without the
 * `.md` extension are the same page (both are visitable).
 */
function samePagePath(a, b) {
  return equalsIgnoreCase(a.replace(/\.md$/i, ''), b.replace(/\.md$/i, ''));
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

const SUBTREE = '/*';

/**
 * Resolves a visited path against the project's redirects (from the
 * kolay config file, carried on `Manifest.redirects`).
 *
 * `path` is the URL path within the docs mount, without a leading slash
 * (the same space the wildcard route's param lives in — for a root
 * mount, the app-relative path).
 *
 * Entries are plain path prefixes, matched whole-segment and
 * case-insensitively. A trailing `/*` matches the prefix itself and
 * everything under it (the remainder is preserved onto `to`); without
 * it, only that exact path matches — with the `.md` extension ignored,
 * since pages are visitable with and without it.
 *
 * The first matching entry wins, and redirects don't chain: the result
 * is not itself resolved again (config validation guarantees no entry's
 * `to` lands where another's `from` would match).
 *
 * Returns the rewritten path, or `undefined` when nothing matches.
 */
function resolveRedirect(path, redirects) {
  for (const {
    from,
    to
  } of redirects) {
    if (from.endsWith(SUBTREE)) {
      const prefix = from.slice(0, -SUBTREE.length);
      const target = to.slice(0, -SUBTREE.length);
      if (equalsIgnoreCase(path, prefix)) return target;
      const head = path.slice(0, prefix.length);
      if (equalsIgnoreCase(head, prefix) && path[prefix.length] === '/') {
        return target + path.slice(prefix.length);
      }
    } else if (samePagePath(path, from)) {
      // pages are visitable with and without `.md`, so exact entries
      // match either form of the visited path
      return to;
    }
  }
  return undefined;
}

/**
 * Where a transition should redirect to, if anywhere: its intended URL,
 * resolved against the project's redirects. `setupKolay` wires this
 * into the router service's `routeWillChange` for you.
 *
 * Returns an app-relative URL (leading slash — ready for
 * `router.transitionTo`), or `undefined` when no entry matches (or the
 * transition wasn't URL-initiated — a `transitionTo(name, ...models)`
 * can't target a redirected URL, since redirected URLs have no route of
 * their own to name).
 */
function redirectTargetFor(transition, redirects) {
  if (redirects.length === 0) return undefined;

  // The intended URL is app-relative (Ember's location layer strips the
  // rootURL before the router sees a URL). `intent` isn't in the public
  // Transition type, but it is where the target URL lives.
  const {
    intent
  } = transition;
  if (typeof intent?.url !== 'string') return undefined;
  const [path = ''] = intent.url.split(/[?#]/);
  const target = resolveRedirect(path.replace(/^\//, ''), redirects);
  return target === undefined ? undefined : '/' + target;
}

/**
 * `addRoutes(context, groupName)` binds the wildcard route it creates to a
 * group — the mount then serves that group's docs regardless of the mount's
 * own path.
 *
 * The bindings are recorded here, at router-map time (there is no owner
 * yet), keyed by the wildcard route's full name (e.g. 'help.page', or
 * 'page' for a top-level mount). The docs service and nav components read
 * them to resolve pages and compute mount-space URLs.
 */
const scopedRouteGroups = new Map();

/**
 * The full name of the wildcard route `addRoutes` creates, given the
 * surrounding route's full name (the DSL's `parent`).
 *
 * At the top of the router map, ember's DSL reports `parent` as
 * 'application', which its own getFullName treats as "no prefix" —
 * mirror that, or a top-level scoped mount would register as
 * 'application.page' while the real route is 'page'.
 */
function scopedRouteNameFor(parent) {
  const prefix = parent === 'application' ? null : parent;
  return prefix ? `${prefix}.page` : 'page';
}
function registerScopedRoute(routeName, groupName) {
  scopedRouteGroups.set(routeName, groupName);
}

/**
 * The group bound to the given wildcard route, if any.
 */
function groupNameForRoute(routeName) {
  return scopedRouteGroups.get(routeName);
}

/**
 * The wildcard route the given group is mounted at, if any.
 */
function routeNameForGroup(groupName) {
  for (const [routeName, group] of scopedRouteGroups) {
    if (group === groupName) return routeName;
  }
  return undefined;
}

/**
 * The index route alongside the given wildcard route —
 * i.e. the mount's own URL.
 */
function indexRouteNameFor(mountRouteName) {
  return mountRouteName === 'page' ? 'index' : mountRouteName.replace(/\.page$/, '.index');
}

/**
 * Where a list item or a footnote definition starts: each is its own
 * excerpt-sized thought, even though a whole list is one block.
 */
const ITEM_START = /^\s*(?:[-*+]\s|\d+[.)]\s|\[\^[^\]]+\]:)/;
const FENCE = /^\s*(?:```|~~~)/;
const HEADING = /^\s*#{1,6}\s/;
const HTML_START = /^\s*</;

/**
 * The excerpt is a couple of lines of prose, so the range has to be no
 * bigger than the thought that matched: a five-item list whose match is in
 * the last item would excerpt to the first item and highlight nothing.
 * Prose only — a fenced sample of the very syntax being documented, or the
 * markup of a hand-written HTML block, reads as noise next to the sentence
 * that explains it. Both run until they are closed, so both are tracked
 * across lines rather than recognized one line at a time.
 */
function excerptRangeFromText(text, term) {
  const ranges = [];
  let offset = 0;
  let fenced = false;
  let html = false;
  let current;
  for (const line of text.split('\n')) {
    const start = offset;
    offset += line.length + 1;
    if (FENCE.test(line)) {
      fenced = !fenced;
      current = undefined;
      continue;
    }

    // a blank line is what closes an HTML block, per CommonMark
    if (!line.trim()) {
      html = false;
      current = undefined;
      continue;
    }
    if (!fenced && HTML_START.test(line)) {
      html = true;
      current = undefined;
      continue;
    }
    if (fenced || html || HEADING.test(line)) {
      current = undefined;
      continue;
    }

    // a line that opens an item breaks off a new range; anything else is a
    // continuation of the lines above it
    if (current && !ITEM_START.test(line)) {
      current.end = start + line.length;
      current.value += `\n${line.toLocaleLowerCase()}`;
      continue;
    }
    current = {
      start,
      end: start + line.length,
      value: line.toLocaleLowerCase()
    };
    ranges.push(current);
  }
  const selected = ranges.find(range => term && range.value.includes(term)) ?? ranges[0];
  return selected ? {
    start: selected.start,
    end: selected.end
  } : {
    start: 0,
    end: 0
  };
}

function rankSearch(entries, query) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return entries.map(entry => {
    const title = entry.title.toLocaleLowerCase();
    const headings = [...entry.headings, ...headingsFromText(entry.text)].join(' ').toLocaleLowerCase();
    const text = entry.text.toLocaleLowerCase();
    const titleMatches = terms.filter(term => title.includes(term)).length;
    const headingMatches = terms.filter(term => headings.includes(term)).length;
    const bodyMatches = terms.filter(term => text.includes(term)).length;
    const score = titleMatches * 100 + headingMatches * 25 + bodyMatches;
    const match = entry.title || entry.headings[0] || entry.groupName;
    const firstTerm = terms.find(term => text.includes(term));
    const excerptRange = excerptRangeFromText(entry.text, firstTerm);
    return {
      ...entry,
      score,
      match,
      excerptRange
    };
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
function headingsFromText(text) {
  return [...text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].flatMap(([, heading]) => heading ? [stripInlineSyntax(heading)] : []);
}

/**
 * A heading is shown as-is, so the source's inline syntax has no business
 * being in it — the marks CommonMark uses for emphasis and code, and the
 * `[^label]` a footnote reference leaves behind.
 */
function stripInlineSyntax(value) {
  return value.replaceAll(/\[\^[^\]]+\]/g, '').replaceAll(/[`*_]/g, '').trim();
}

/**
 * A leading (closed) frontmatter block: `---`, lines, `---`. The build
 * strips frontmatter from the text it inlines; this covers the text the
 * runtime loads itself — a plain `.md`'s raw source, from its bundled
 * loader or a fetch of the deployed file.
 */
const FRONTMATTER_BLOCK = /^\uFEFF?---\r?\n([\s\S]*?\r?\n)?---(\r?\n|$)/;
function stripFrontmatter(text) {
  return text.replace(FRONTMATTER_BLOCK, '');
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

/**
 * A module containing a document, e.g. the result of `import('/some-doc.md?raw')`
 * or of a compiled `.gjs.md` module.
 */

/**
 * What a document may be loaded as:
 * - a string of markdown (compiled in the browser)
 * - an already-compiled component (e.g.: the module of a build-time-compiled `.gjs.md` file)
 * - a module whose default export is either of the above
 */

/**
 * Reactive state for rendering a single document that you load yourself.
 *
 * This is the same machinery that the `<Page />` component (via `selected`)
 * uses for rendering the current page — extracted so that documents fetched
 * any other way (`fetch`, `import()`, inline strings, etc.) get the same
 * loading / error / anti-flicker behavior.
 *
 * The compiler is configured via `setupKolay` (or `setupCompiler` in
 * tests), so one of those must have run before a document loads.
 *
 * The `load` function is reactive: any tracked data read synchronously
 * (before the first `await`) will cause the document to be re-loaded when
 * that data changes. While re-loading, the previously rendered document is
 * kept, avoiding a flash of emptiness.
 *
 * ```gjs
 * import Component from '@glimmer/component';
 * import { compiledDoc } from 'kolay';
 *
 * export default class MyPage extends Component {
 *   doc = compiledDoc(() =>
 *     fetch(`/my-docs/${this.args.name}.md`).then((response) => response.text())
 *   );
 *
 *   <template>
 *     {{#if this.doc.isPending}}
 *       loading…
 *     {{else if this.doc.hasError}}
 *       {{this.doc.error}}
 *     {{else if this.doc.prose}}
 *       <this.doc.prose />
 *     {{/if}}
 *   </template>
 * }
 * ```
 */
function compiledDoc(load) {
  return new CompiledDoc(load);
}
function isDocModule(source) {
  return typeof source === 'object' && source !== null && 'default' in source;
}
class CompiledDoc {
  #load;
  constructor(load) {
    this.#load = load;
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
  #stateCache = createCache(() => {
    const source = this.#load();
    if (source === undefined) return;

    // The compiler is per-owner; documents at an URL can't change, so any
    // live owner that setupKolay registered will do.
    const owner = getKey();
    assert(`[Bug] Owner is missing`, owner);
    const resolve = async () => {
      const resolved = await source;
      const doc = isDocModule(resolved) ? resolved.default : resolved;
      if (typeof doc === 'string') {
        const state = compileText(owner, doc);
        return state.promise;
      }
      return doc;
    };
    return getPromiseState(() =>
    // Holds `settled()` (visit/click in tests) open for the fetch and
    // compile, so tests never see a partially-rendered page. No-op in
    // production builds.
    waitForPromise(resolve()));
  });
  get #state() {
    return getValue(this.#stateCache);
  }
  #previousState;

  /*********************************************************************
   * This is a pattern to help reduce flashes of content during
   * the intermediate states of the above request fetchers.
   * When a new request starts, we'll hold on the old value for as long as
   * we can, and only swap out the old data when the new data is done loading.
   *
   * (reading `isLoading` entangles this getter with the request's
   *  progress, so consumers re-render when loading finishes)
   ********************************************************************/
  get latest() {
    const current = this.#state;
    if (current?.isLoading) {
      return this.#previousState ?? current;
    }
    this.#previousState = current;
    return current;
  }

  /**
   * The rendered document, ready for invoking.
   * While a new document is loading, this remains the previous document.
   */
  get prose() {
    if (this.hasError) {
      return;
    }
    return this.latest?.resolved;
  }
  get isReady() {
    return Boolean(this.latest?.resolved);
  }
  get isPending() {
    return !this.isReady;
  }

  /**
   * The raw error from loading or compiling, if there was one.
   * See `error` for a human-readable message.
   */
  get rawError() {
    return this.latest?.error;
  }

  /**
   * A human-readable message extracted from `rawError`
   * (may be `''` when the raw error has no extractable message).
   */
  get error() {
    return extractErrorMessage(this.rawError);
  }
  get hasError() {
    return Boolean(this.rawError);
  }
}

function selected(context) {
  const owner = getKey();
  return createStore(owner, Selected);
}
/**
 * The store `selected(context)` returns.
 */
class Selected {
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  /**
   * The page-module map — path to document loader.
   * `setupKolay` fills this in; reading it directly is rarely needed.
   */
  compiledDocs = {};
  get #docs() {
    return docsManager();
  }

  /**
   * The load / compile / error state for the current page's document.
   */
  doc = compiledDoc(() => {
    const path = this.#matchOrFirstPagePath;
    if (!path) return;

    /**
     * NOTE: we support paths with and withouth the '.md' on the URL
     */
    const fn = this.compiledDocs[path] ?? this.compiledDocs[path + '.md'];
    return fn?.();
  });

  /**
   * The rendered document (a component), if ready.
   *
   * While a new page loads (or after it errored), this keeps the
   * previously rendered page, so navigation doesn't flash an empty screen.
   */
  get prose() {
    if (this.error) {
      return;
    }
    return this.doc.prose;
  }

  /**
   * Has the current page finished loading and compiling?
   */
  get isReady() {
    return this.doc.isReady;
  }

  /**
   * Is the current page still loading / compiling?
   */
  get isPending() {
    return !this.isReady;
  }

  /**
   * Did resolving the page, loading, or compiling fail?
   */
  get hasError() {
    if (this.error) {
      return Boolean(this.error);
    }
    return this.doc.hasError;
  }

  /**
   * A human-readable error message; `''` when there is none.
   */
  get error() {
    if (!this.#page) {
      const message = `Page not found for path "${this.#path}". (Using group: "${this.#docs.currentGroup.name}", see console for more information)`;
      this.#printError(message);
      return message;
    }
    const error = this.doc.error;
    if (!error) return '';
    this.#printError(`An error occurred`, error);
    return error;
  }

  /**
   * `Boolean(this.prose)`
   */
  static {
    n(this.prototype, "error", [cached]);
  }
  get hasProse() {
    return Boolean(this.prose);
  }
  get #path() {
    // Inside a scoped mount (addRoutes(context, groupName)), the URL space
    // is the mount's — the docs service translates it back to manifest space.
    const scoped = this.#docs.scopedPagePath;
    if (scoped) {
      return scoped.replace(/\.md$/i, '');
    }
    if (!this.router.currentURL) return;

    // currentURL is app-relative — Ember's location layer already stripped
    // the rootURL — so use its pathname verbatim.
    const url = new URL(this.router.currentURL, window.location.origin);
    const path = url.pathname;
    if (path === '/') {
      return;
    }
    return path.replace(/\.md$/i, '');
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

function searcher(context) {
  const owner = getKey();
  return createStore(owner, SearchService);
}
class SearchService {
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  /**
   * @internal
   */

  #searchDataPromise;
  get #selected() {
    return selected();
  }

  /**
   * Rank every page against a query.
   *
   * Async because the index is: the manifest, and then the text of any page
   * the build couldn't inline. Both are loaded once and kept, so only the
   * first search waits — and the awaiting belongs to whatever renders the
   * results, which has to describe a pending search anyway.
   */
  search = async query => {
    return rankSearch(await this.#searchEntries(), query);
  };
  loadSearchData = () => {
    return this.#searchDataPromise ??= this._loadSearchData?.() ?? Promise.resolve([]);
  };

  /**
   * Where a page's markdown is deployed: the app's rootURL over the page's
   * own manifest-space path. Deployment layout, not routing — a group mounted
   * at some other URL by `addRoutes(context, groupName)` still has its file
   * where the manifest put it.
   */
  #sourceUrlFor(entry) {
    const base = this.router.rootURL ?? '/';
    const path = entry.appRelativePath.replace(/^\//, '');
    const url = `${base.endsWith('/') ? base : `${base}/`}${path}`;
    return url.endsWith('.md') ? url : `${url}.md`;
  }

  /**
   * The index: every entry with its text, however that text had to be got.
   * Cached as the promise, so concurrent searches share one load.
   */
  async #searchEntries() {
    const entries = await this.loadSearchData();
    return Promise.all(entries.map(async entry => {
      if (entry.text) return entry;

      // one unreadable page is not a failed search
      const text = await this.#searchTextFor(entry).catch(() => '');
      return {
        ...entry,
        text
      };
    }));
  }

  /**
   * A page's own markdown, for pages the build couldn't inline (plain `.md`,
   * whose source isn't already in the manifest).
   *
   * The loader the renderer uses is the first choice: it is part of the
   * bundle, so it resolves wherever the app is deployed. Fetching only covers
   * pages the app doesn't bundle, and the URL for that is built here rather
   * than stored in the manifest — the manifest is built against the vite
   * config's `base`, while the app is served under `router.rootURL`, and the
   * two are only the same by convention.
   */
  async #searchTextFor(entry) {
    // the manifest is inconsistent about the extension, so both spellings are
    // tried — the same lookup the selected store does
    const loaders = this.#selected.compiledDocs;
    const loader = loaders[entry.path] ?? loaders[`${entry.path}.md`];
    if (loader) {
      const module = await loader();
      return typeof module.default === 'string' ? stripFrontmatter(module.default) : '';
    }
    const response = await fetch(this.#sourceUrlFor(entry));

    // A path that was never deployed is answered with the app's own
    // index.html by every SPA host, at 200 — indexing that would match every
    // page in the site on the markup around its pages.
    if (!response.ok) return '';
    if (response.headers.get('content-type')?.includes('html')) return '';
    return stripFrontmatter(await response.text());
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
    /**
     * remarkFrontmatter handles removing frontmatter from output
     * rebaseAuthoredLinks handles rewriting urls begining with / to match Ember rootUrl
     *
     * Both of these are preprocessed so that consumers do not need to declare these plugins
     * in their own setup.
     *
     * This is common enough to be handled by Kolay directly
     */
    remarkPlugins: [remarkFrontmatter, rebaseAuthoredLinks(rootURL), ...(remarkPlugins ?? [])],
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

/**
 * The store `docsManager(context)` returns: the manifest, the current
 * group, and helpers for resolving pages and building hrefs.
 */
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
  get #search() {
    return searcher();
  }
  /**
   * Wires the loaded docs modules into the store.
   * The generated `setupKolay` calls this — apps rarely call it directly.
   */
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

  /**
   * Internal wiring shared by `setup` and the test-support helpers.
   *
   * @private
   */
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
      this.#search._loadSearchData = compiledDocs.loadSearchData;
      this.#setupRedirects(compiledDocs.manifest);
    }
  }
  #redirectsWired = false;

  /**
   * Serves the manifest's `redirects` (from the project's kolay config
   * file) automatically: future transitions are checked in
   * `routeWillChange`, and — because setup runs inside the application
   * route's model hook, during the initial transition, whose
   * `routeWillChange` has already fired — the URL the app arrives on is
   * corrected when that transition lands (with `replaceWith`: the old
   * URL is already in the history).
   *
   * Redirect targets can never themselves redirect (config validation
   * rejects chains), so the redirecting transitions fire these handlers
   * harmlessly.
   */
  #setupRedirects(manifest) {
    if (this.#redirectsWired) return;
    const redirects = manifest.redirects;
    if (redirects.length === 0) return;
    this.#redirectsWired = true;
    const router = this.router;
    const onRouteWillChange = transition => {
      const target = redirectTargetFor(transition, redirects);
      if (target !== undefined) {
        router.transitionTo(target);
      }
    };
    router.on('routeWillChange', onRouteWillChange);
    registerDestructor(this, () => router.off('routeWillChange', onRouteWillChange));
    const checkArrival = () => {
      // routeDidChange has fired: the router has arrived somewhere, so
      // currentURL is set (the null in its type covers pre-arrival)
      const current = router.currentURL;
      if (!current) return;
      const [path = ''] = current.split(/[?#]/);
      const target = resolveRedirect(path.replace(/^\//, ''), redirects);
      if (target !== undefined) {
        router.replaceWith('/' + target);
      }
    };

    // During normal boot, setup runs inside the application route's
    // model hook — mid-initial-transition, so currentURL is still null
    // and that transition's routeWillChange fired before the listener
    // above existed. Correct the arrival URL when the transition lands.
    // (A set currentURL means setup ran after boot — tests — where the
    // app already arrived: check now, since routeDidChange won't refire.)
    if (router.currentURL) {
      checkArrival();
    } else {
      // self-removing; the router can't outlive this store (same owner),
      // so no destructor is needed
      router.one('routeDidChange', checkArrival);
    }
  }
  get docs() {
    assert(`Docs' manifest was not loaded. Be sure to call setup() before accessing anything on the docs service.`, this._docs);
    return this._docs;
  }

  /**
   * The loaded manifest: the app's `base` (rootURL) and every group.
   */
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
   * The name of the group currently being viewed.
   *
   * The first URL segment names the group — unless the current route is
   * inside a scoped mount (`addRoutes(context, groupName)`), in which
   * case the mount decides.
   */
  get selectedGroup() {
    // A scoped mount (addRoutes(context, groupName)) decides the group,
    // regardless of the URL
    const scoped = this.#activeScopedMount;
    if (scoped) return scoped.groupName;

    // currentURL is app-relative (Ember's location layer already stripped
    // the rootURL), but it can carry query params — drop them before
    // segmenting.
    const [path = ''] = this.router.currentURL?.split(/[?#]/) ?? [];
    const [, /* leading slash */first] = path.split('/');
    if (!first) return this.availableGroups[0];
    return this.canonicalGroupName(first) ?? this.availableGroups[0];
  }

  /**
   * The manifest's own casing for a group name, matched case-insensitively —
   * URLs are conventionally case-insensitive, but hrefs / `urlFor` need the
   * manifest's casing.
   */
  canonicalGroupName = name => {
    return this.availableGroups.find(candidate => equalsIgnoreCase(candidate, name));
  };

  /**
   * The scoped mount (`addRoutes(context, groupName)`) the current route
   * is inside of, if any.
   */
  get #activeScopedMount() {
    let info = this.router.currentRoute;
    while (info) {
      const groupName = groupNameForRoute(info.name);
      if (groupName) {
        return {
          groupName,
          pageParam: info.params?.page
        };
      }
      info = info.parent;
    }
    return undefined;
  }

  /**
   * When inside a scoped mount, the manifest-space path of the visited
   * page (the mount's URL space differs from the manifest's).
   */
  get scopedPagePath() {
    const scoped = this.#activeScopedMount;
    if (!scoped?.pageParam) return;
    return `/${scoped.groupName}/${scoped.pageParam}`;
  }
  #groupNameOf = page => {
    const groups = this.manifest?.groups ?? [];

    // by value, not identity: the manifest's tree and list are separate
    // object graphs after being serialized into the virtual module
    return groups.find(group => group.list.some(candidate => candidate.appRelativePath === page.appRelativePath))?.name;
  };
  #groupRelative(page, groupName) {
    const prefix = `/${groupName}/`;
    return page.appRelativePath.startsWith(prefix) ? page.appRelativePath.slice(prefix.length) : page.appRelativePath.replace(/^\//, '');
  }

  /**
   * The URL to link to for a page: its manifest path — unless the page's
   * group is mounted via a scoped `addRoutes(context, groupName)`, in which
   * case the mount decides. Includes the rootURL, like `page.path`.
   */
  hrefFor = page => {
    if (typeof page.href === 'string') return page.path;
    const groupName = this.#groupNameOf(page);
    const mountRoute = groupName ? routeNameForGroup(groupName) : undefined;
    if (!groupName || !mountRoute) return page.path;
    return this.router.urlFor(mountRoute, this.#groupRelative(page, groupName));
  };

  /**
   * Like `hrefFor`, without the rootURL — the space `router.currentURL`
   * and `transitionTo` operate in.
   */
  appRelativeHrefFor = page => {
    if (typeof page.href === 'string') return page.appRelativePath;
    const groupName = this.#groupNameOf(page);
    const mountRoute = groupName ? routeNameForGroup(groupName) : undefined;
    if (!groupName || !mountRoute) return page.appRelativePath;
    const url = this.router.urlFor(mountRoute, this.#groupRelative(page, groupName));
    const base = this.router.rootURL ?? '/';
    if (base === '/') return url;
    return '/' + url.slice(base.length).replace(/^\/+/, '');
  };

  /**
   * The URL a group's nav link should point at: `/GroupName` — unless the
   * group is mounted via a scoped `addRoutes(context, groupName)`, in which
   * case the mount's own URL. Includes the rootURL.
   */
  groupHrefFor = groupName => {
    const mountRoute = routeNameForGroup(groupName);
    if (!mountRoute) {
      return this.router.rootURL + groupName;
    }
    return this.router.urlFor(indexRouteNameFor(mountRoute));
  };

  /**
   * Navigate to a group's first page (or its mount's own URL, for a
   * scoped mount).
   */
  selectGroup = group => {
    assert(`Expected group name, ${group}, to be one of ${this.availableGroups.join(', ')}`, this.availableGroups.includes(group));
    if (group === 'root') {
      this.router.transitionTo('/');
      return;
    }
    const mountRoute = routeNameForGroup(group);
    if (mountRoute) {
      // scoped mounts live at their own URL, not at /GroupName
      this.router.transitionTo(indexRouteNameFor(mountRoute));
      return;
    }
    this.router.transitionTo(`/${group}`);
  };

  /**
   * Every group's name, in manifest order.
   */
  get availableGroups() {
    const groups = this.manifest?.groups ?? [];
    return groups.map(group => group.name);
  }

  /**
   * The manifest entry for `selectedGroup`.
   */
  get currentGroup() {
    return this.groupFor(this.selectedGroup);
  }

  /**
   * The manifest entry for a group, by name. Asserts if the group
   * doesn't exist.
   */
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
      const page = group.list.find(page => equalsIgnoreCase(page.appRelativePath, url));
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
    return this.pages.find(page => samePagePath(page.appRelativePath, path));
  };
}

export { CompiledDoc as C, HOME_GROUP as H, PREPARE_DOCS as P, isPageTree as a, scopedRouteNameFor as b, groupNameForRoute as c, docsManager as d, compiledDoc as e, resolveRedirect as f, getIndexPage as g, searcher as h, isIndex as i, samePagePath as j, forceFindOwner as k, compilerOptions as l, registerScopedRoute as r, selected as s };
//# sourceMappingURL=docs-CMPK6ht1.js.map
