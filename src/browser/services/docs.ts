import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';

import { Shadowed } from 'ember-primitives/components/shadowed';
import { createStore } from 'ember-primitives/store';
import { type ModuleMap, type ScopeMap, setupCompiler } from 'ember-repl';

import { rebaseAuthoredLinks } from '../../rebase-links.js';
import { redirectTargetFor, resolveRedirect } from '../redirects.ts';
import {
  groupNameForRoute,
  indexRouteNameFor,
  mountLocationFor,
  routeNameForGroup,
} from '../scoped-routes.ts';
import { APIDocs, CommentQuery } from '../typedoc/renderer.gts';
import { ComponentSignature } from '../typedoc/signature/component.gts';
import { HelperSignature } from '../typedoc/signature/helper.gts';
import { ModifierSignature } from '../typedoc/signature/modifier.gts';
import { equalsIgnoreCase, findPageTree, samePagePath } from '../utils.ts';
import { typedocLoader } from './api-docs.ts';
import { getKey } from './lazy-load.ts';
import { searcher } from './search.ts';
import { selected } from './selected.ts';

import type { LoadTypedoc, Manifest, Page, SearchEntry } from '../../types.ts';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type { ComponentLike } from '@glint/template';

export type SetupOptions = Parameters<DocsService['setup']>[0];

export function docsManager(context: unknown) {
  const owner = getKey(context);

  return createStore(owner, DocsService);
}

export const LOAD_MANIFEST = Symbol('__KOLAY__LOAD_MANIFEST__');
export const PREPARE_DOCS = Symbol('__KOLAY__PREPARE_DOCS__');

export function compilerOptions({
  rootURL = '/',
  topLevelScope,
  remarkPlugins,
  rehypePlugins,
  modules,
}: {
  /**
   * The app's rootURL, so authored root-absolute URLs are rebased onto it.
   * Accepts a getter for callers that build options before the rootURL is
   * known. At the default '/', rebasing is a no-op.
   */
  rootURL?: string | (() => string);
  topLevelScope?: ScopeMap;
  modules?: ModuleMap;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
} = {}) {
  const md = {
    // Prepended so authored root-absolute URLs are rebased onto the rootURL
    // before any consumer plugin serializes mdast nodes to raw HTML. Living
    // here (not in setup()) means every compiler built from these options —
    // including the test-support one — gets the same behavior.
    remarkPlugins: [rebaseAuthoredLinks(rootURL), ...(remarkPlugins ?? [])],
    rehypePlugins,
  };
  const scope = {
    Shadowed,
    APIDocs,
    CommentQuery,
    ComponentSignature,
    ModifierSignature,
    HelperSignature,
    ...topLevelScope,
  };

  return {
    options: {
      md,
      gmd: {
        scope,
        ...md,
      },
      hbs: {
        scope,
      },
    },
    modules: {
      kolay: () => import('../index.ts'),
      'kolay/components': () => import('../components.ts'),
      'kolay/typedoc': () => import('../typedoc/index.ts'),
      ...modules,
    },
  };
}

/**
 * The store `docsManager(context)` returns: the manifest, the current
 * group, and helpers for resolving pages and building hrefs.
 */
class DocsService {
  @service declare private router: RouterService;

  private get apiDocs() {
    return typedocLoader(this);
  }

  get #selected() {
    return selected(this);
  }

  get #search() {
    return searcher(this);
  }

  private _docs: Manifest | undefined;

  /**
   * Wires the loaded docs modules into the store.
   * The generated `setupKolay` calls this — apps rarely call it directly.
   */
  setup = async (options: {
    /**
     * The module of the api docs virtual module.
     * This should be set to `await import('kolay/api-docs:virtual')
     */
    apiDocs?: Promise<{ packageNames: string[]; loadApiDocs: LoadTypedoc }>;

    /**
     * The module of the compiled docs virtual module.
     * This should be set to `await import('kolay/compiled-docs:virtual')
     */
    compiledDocs?: {
      manifest: Manifest;
      pages: Record<string, () => Promise<{ default: string | ComponentLike }>>;
      loadSearchData: () => Promise<SearchEntry[]>;
    };

    /**
     * Additional invokables that you'd like to have access to
     * in the markdown, without a codefence.
     *
     * By default, the fallowing is available:
     * - for escaping styles / having a clean style-sandbox
     *   - <Shadowed>
     * - for rendering your typedoc:
     *   - <APIDocs>
     *   - <ComponentSignature>
     */
    topLevelScope?: ScopeMap;

    /**
     * Additional modules you'd like to be able to import from.
     * This is in addition the the default modules provided by ember,
     * and allows you to have access to private libraries without
     * needing to publish those libraries to NPM.
     */
    modules?: ModuleMap;

    /**
     * Provide additional remark plugins to the default markdown compiler.
     *
     * These can be used to add features like notes, callouts, footnotes, etc
     */
    remarkPlugins?: unknown[];
    /**
     * Provide additional rehype plugins to the default html compiler.
     *
     * These can be used to add features syntax-highlighting to pre elements, etc
     */
    rehypePlugins?: unknown[];
  }) => {
    const [apiDocs, compiledDocs] = await Promise.all([options.apiDocs, options.compiledDocs]);

    this[PREPARE_DOCS](apiDocs, compiledDocs);

    const optionsForCompiler = compilerOptions({
      rootURL: this.router.rootURL,
      topLevelScope: options.topLevelScope,
      remarkPlugins: options.remarkPlugins ?? [],
      rehypePlugins: options.rehypePlugins ?? [],
      modules: options.modules,
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
  [PREPARE_DOCS](
    apiDocs: { packageNames: string[]; loadApiDocs: LoadTypedoc } | undefined,
    compiledDocs:
      | {
          manifest: Manifest;
          pages: Record<string, () => Promise<{ default: string | ComponentLike }>>;
          loadSearchData: () => Promise<SearchEntry[]>;
        }
      | undefined
  ) {
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
      this.#setupPageTreeRedirects();
    }
  }

  #pageTreeRedirectsWired = false;

  /**
   * `undefined` unless the URL names a `PageTree`. A page visit also resolves
   * to the wildcard's index, with the page as its param.
   */
  #landingForRouteInfo(to: Transition['to'] | RouterService['currentRoute']): Page | undefined {
    if (to?.localName !== 'index') return;

    const { wildcardParam, mountGroupNames } = mountLocationFor(to);

    // Through `canonicalGroupName` because `addRoutes` stores whatever the app
    // author passed, unchecked. A top-level mount's candidates are the routes
    // above its wildcard, which name no group, so it falls through.
    const mountGroup = mountGroupNames
      .map((name) => this.canonicalGroupName(name))
      .find((name) => name !== undefined);

    // The mount's own URL (`/guides`), which carries no wildcard to resolve:
    // the mount's group root is the destination. Ember does not re-enter a
    // mount route that is already active, so `handlePotentialIndexVisit` on it
    // only fires on the way in — a reader clicking the group's own nav link
    // from inside the mount would otherwise land on a blank index.
    if (!wildcardParam) {
      if (!mountGroup) return;

      return this.landingForPageTree(this.groupFor(mountGroup).tree.appRelativePath, mountGroup);
    }

    if (!mountGroup) return this.landingForPageTree(`/${wildcardParam}`);

    // Not always the group's name: `Home`'s prefix is the root.
    const prefix = this.groupFor(mountGroup).tree.appRelativePath.replace(/\/$/, '');

    return this.landingForPageTree(`${prefix}/${wildcardParam}`, mountGroup);
  }

  /**
   * On `routeWillChange`, not a route's `beforeModel`: a mount route has no
   * dynamic segment, so Ember doesn't re-enter it when only the wildcard's
   * param changes — and clicking an authored link (`properLinks` makes it an
   * in-app transition) is how readers arrive. No loop: the destination is a
   * page path, which `landingForPageTree` declines.
   */
  #setupPageTreeRedirects() {
    if (this.#pageTreeRedirectsWired) return;

    this.#pageTreeRedirectsWired = true;

    const router = this.router;

    const onRouteWillChange = (transition: Transition) => {
      const landing = this.#landingForRouteInfo(transition.to);

      if (landing) {
        router.transitionTo(this.appRelativeHrefFor(landing));
      }
    };

    router.on('routeWillChange', onRouteWillChange);
    registerDestructor(this, () => router.off('routeWillChange', onRouteWillChange));

    const checkArrival = () => {
      const landing = this.#landingForRouteInfo(router.currentRoute);

      if (landing) {
        router.replaceWith(this.appRelativeHrefFor(landing));
      }
    };

    // Same boot problem, and fix, as `#setupRedirects` below: setup runs
    // mid-initial-transition, after that transition's `routeWillChange`.
    if (router.currentURL) {
      checkArrival();
    } else {
      router.one('routeDidChange', checkArrival);
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
  #setupRedirects(manifest: Manifest) {
    if (this.#redirectsWired) return;

    const redirects = manifest.redirects;

    if (redirects.length === 0) return;

    this.#redirectsWired = true;

    const router = this.router;

    const onRouteWillChange = (transition: Transition) => {
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

  private get docs() {
    assert(
      `Docs' manifest was not loaded. Be sure to call setup() before accessing anything on the docs service.`,
      this._docs
    );

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
    const [, /* leading slash */ first] = path.split('/');

    if (!first) return this.availableGroups[0];

    return this.canonicalGroupName(first) ?? this.availableGroups[0];
  }

  /**
   * The manifest's own casing for a group name, matched case-insensitively —
   * URLs are conventionally case-insensitive, but hrefs / `urlFor` need the
   * manifest's casing.
   */
  canonicalGroupName = (name: string): string | undefined => {
    return this.availableGroups.find((candidate) => equalsIgnoreCase(candidate, name));
  };

  /**
   * The scoped mount (`addRoutes(context, groupName)`) the current route
   * is inside of, if any.
   */
  get #activeScopedMount(): { groupName: string; pageParam: string | undefined } | undefined {
    let info = this.router.currentRoute;

    while (info) {
      const groupName = groupNameForRoute(info.name);

      if (groupName) {
        return { groupName, pageParam: info.params?.page as string | undefined };
      }

      info = info.parent;
    }

    return undefined;
  }

  /**
   * When inside a scoped mount, the manifest-space path of the visited
   * page (the mount's URL space differs from the manifest's).
   */
  get scopedPagePath(): string | undefined {
    const scoped = this.#activeScopedMount;

    if (!scoped?.pageParam) return;

    return `/${scoped.groupName}/${scoped.pageParam}`;
  }

  #groupNameOf = (page: Page): string | undefined => {
    const groups = this.manifest?.groups ?? [];

    // by value, not identity: the manifest's tree and list are separate
    // object graphs after being serialized into the virtual module
    return groups.find((group) =>
      group.list.some((candidate) => candidate.appRelativePath === page.appRelativePath)
    )?.name;
  };

  #groupRelative(page: Page, groupName: string): string {
    const prefix = `/${groupName}/`;

    return page.appRelativePath.startsWith(prefix)
      ? page.appRelativePath.slice(prefix.length)
      : page.appRelativePath.replace(/^\//, '');
  }

  /**
   * The URL to link to for a page: its manifest path — unless the page's
   * group is mounted via a scoped `addRoutes(context, groupName)`, in which
   * case the mount decides. Includes the rootURL, like `page.path`.
   */
  hrefFor = (page: Page): string => {
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
  appRelativeHrefFor = (page: Page): string => {
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
  groupHrefFor = (groupName: string): string => {
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
  selectGroup = (group: string) => {
    assert(
      `Expected group name, ${group}, to be one of ${this.availableGroups.join(', ')}`,
      this.availableGroups.includes(group)
    );

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

    return groups.map((group) => group.name);
  }

  /**
   * The manifest entry for `selectedGroup`.
   */
  @cached
  get currentGroup() {
    return this.groupFor(this.selectedGroup);
  }

  /**
   * The manifest entry for a group, by name. Asserts if the group
   * doesn't exist.
   */
  groupFor = (groupName: string | undefined) => {
    const groups = this.manifest?.groups ?? [];

    const group = groups.find((group) => group.name === groupName);

    assert(
      `Could not find group in manifest under the name ${groupName}. The available groups are: ${groups.map((group) => group.name).join(', ')}`,
      group
    );

    return group;
  };

  /**
   * Will return false if a url doesn't exist in any group,
   * or the name of the group that contains the page if the url does exist.
   */
  groupForURL = (url: string): false | string => {
    for (const groupName of this.availableGroups) {
      const group = this.groupFor(groupName);
      const page = group.list.find((page) => equalsIgnoreCase(page.appRelativePath, url));

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
  findByPath = (path: string) => {
    return this.pages.find((page) => samePagePath(page.appRelativePath, path));
  };

  /**
   * The page a tree's own URL should land on: its first. Takes a
   * manifest-space path, and answers `undefined` when that path names a page,
   * or nothing. `groupName` scopes the search — two groups can hold one
   * manifest path — and a name matching no group answers `undefined`.
   */
  landingForPageTree = (appRelativePath: string, groupName?: string): Page | undefined => {
    let groups = this.manifest?.groups ?? [];

    if (groupName !== undefined) {
      const canonical = this.canonicalGroupName(groupName);

      if (!canonical) return undefined;

      groups = [this.groupFor(canonical)];
    }

    // A path naming a page must not redirect. Not via `findByPath`: it
    // searches `currentGroup`, derived from `router.currentURL`, which is
    // still the previous page while a transition resolves.
    for (const group of groups) {
      if (group.list.some((page) => samePagePath(page.appRelativePath, appRelativePath))) return;
    }

    for (const group of groups) {
      // `tree.first` is the build's own answer (`addInTheFirstPage`), as a
      // base-prefixed path; `group.list` is flattened from the same tree, so
      // the page is in there.
      const tree = findPageTree(group.tree, appRelativePath);
      const first = tree?.first;

      if (!first) continue;

      const page = group.list.find((candidate) => candidate.path === first);

      // A tree with no pages shouldn't end the search for a group that has one.
      if (page) return page;
    }

    return undefined;
  };
}

export type { DocsService };
