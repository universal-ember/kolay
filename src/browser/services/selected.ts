import { cached } from '@glimmer/tracking';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';
import { service } from '@ember/service';

import { createStore } from 'ember-primitives/store';
import { use } from 'ember-resources';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { keepLatest } from 'reactiveweb/keep-latest';

import { compileText } from './compiler/reactive.ts';
import { docsManager } from './docs.ts';
import { extractErrorMessage } from './extract-error-message.ts';
import { getKey } from './lazy-load.ts';

import type { Page } from '../../types.ts';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';

export function selected(context: unknown) {
  const owner = getKey(context);

  return createStore(owner, Selected);
}

type File = { default: string | ComponentLike };
type Loader = () => Promise<File>;

/**
 * Normalize a page path into the form used as keys in `kolay/compiled-docs:virtual`
 * and the manifest: no trailing slash (except for the root `/`), no `.md` suffix.
 *
 * Without this, an SSG'd URL like `/usage/setup/` (with the trailing slash that
 * static-file servers add when serving `/usage/setup/index.html`) misses the
 * `/usage/setup` manifest entry, causing Selected to error and stomp the
 * server-rendered DOM during rehydration.
 *
 * @param path A URL pathname like `/usage/setup/`, `/usage/setup.md`, or `/usage/setup`
 */
function normalizePagePath(path: string): string {
  let normalized = path.replace(/\.md$/, '');

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Resolved page modules, keyed by URL path. Module-scoped so it survives
 * Selected instance recreation (route transitions, SSR rehydration, etc.).
 *
 * Why this exists: `loaderFor` previously passed a fresh `wrapper` closure to
 * `getPromiseState` on every call. `getPromiseState` caches state by function
 * reference, so a new wrapper always started in `isLoading: true` for one
 * microtask — long enough for Glimmer to render the `<:pending>` branch on the
 * client even though the SSR'd DOM had the resolved `<:success>` content,
 * causing a flash of stale content during rehydration.
 *
 * With this cache, the second-and-onward access for any path resolves
 * synchronously. Combined with `prefetchPage` called from the client entry
 * before boot, the first client render of an SSR'd page matches the DOM with
 * no mismatch.
 */
const moduleCache = new Map<string, ComponentLike>();

/**
 * Eagerly load a page module so the next read of `Selected.prose` returns
 * synchronously. Call from your client entry before booting Ember, against the
 * current URL, to eliminate the flash-of-pending-state during SSR rehydration.
 *
 * @example
 * ```ts
 * import { prefetchPage } from 'kolay';
 * await prefetchPage(window.location.pathname);
 * Application.create(config.APP);
 * ```
 */
export async function prefetchPage(path: string): Promise<void> {
  const trimmed = normalizePagePath(path);

  if (moduleCache.has(trimmed)) return;

  // The virtual module is provided by kolay's vite/webpack plugin in the
  // consumer's build. We let the bundler rewrite this specifier at build
  // time — without that, the browser sees the raw `kolay/compiled-docs:virtual`
  // specifier at runtime and bails with "Failed to resolve module specifier",
  // moduleCache stays empty, and loaderFor falls through to the async
  // getPromiseState path, which is the rehydration FOUC the prefetch was
  // supposed to prevent in the first place.
  const mod = (await import('kolay/compiled-docs:virtual')) as {
    pages: Record<string, Loader>;
  };
  const fn = mod.pages[trimmed] ?? mod.pages[trimmed + '.md'];

  if (!fn) return;

  const file = await fn();

  // `.md` files need runtime markdown compilation through ember-repl which
  // requires an owner; skip prewarming those and let Selected's async path
  // handle them on first render.
  if (typeof file.default !== 'string') {
    moduleCache.set(trimmed, file.default);
  }
}

/**
 * Pre-load + deserialize the typedoc JSON for every configured
 * `apiDocs({ packages: [...] })` entry, so the first `<APIDocs>` /
 * `<Load>` render on rehydration is synchronous and matches the SSG'd
 * `<section>`.
 *
 * Without this prewarm, every `<Load>` first-renders the
 * "Loading api docs..." branch (because the fetch starts in
 * `isLoading: true`), unmounting the SSG-rendered typedoc declarations
 * for ~the duration of the fetch. With it, `<Load>` reads from the
 * project cache synchronously.
 *
 * Safe to call before `Application.create`: it only needs `fetch` to
 * be available, not an Ember owner.
 *
 * @example
 * ```ts
 * import { prefetchPage, prewarmTypedocCaches } from 'kolay';
 *
 * if (shouldRehydrate()) {
 *   await Promise.all([
 *     prefetchPage(window.location.pathname),
 *     prewarmTypedocCaches(),
 *   ]);
 * }
 * ```
 */
export async function prewarmTypedocCaches(): Promise<void> {
  let mod: {
    packageNames?: string[];
    loadApiDocs?: Record<string, () => Promise<Response>>;
  };

  try {
    mod = (await import('kolay/api-docs:virtual')) as typeof mod;
  } catch {
    return;
  }

  const names = mod.packageNames ?? [];
  const loaders = mod.loadApiDocs ?? {};

  if (names.length === 0) return;

  const { prewarmTypedocCache } = await import('../typedoc/utils.gts');

  await Promise.all(
    names.map((name) => {
      const loader = loaders[name];

      if (!loader) return;

      return prewarmTypedocCache(name, loader);
    })
  );
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
function loaderFor(selected: Selected, maybePath: string | undefined) {
  if (!maybePath) return;

  const path: string = maybePath;

  const docs = selected.compiledDocs;
  const owner = getOwner(selected);

  /**
   * NOTE: we support paths with and withouth the '.md' on the URL
   */
  const fn = docs[path] ?? docs[path + '.md'];

  // Synchronous fast path: when the module is already cached (mid-session
  // re-navigation, or pre-warmed via prefetchPage before rehydration), return
  // a resolved state immediately. This avoids the microtask hop through
  // getPromiseState's pending state that causes Glimmer to render `<:pending>`
  // before flipping to `<:success>` — the source of the rehydration flash.
  const cached = moduleCache.get(path);

  if (cached) {
    return { isLoading: false, error: null, resolved: cached };
  }

  async function wrapper(): Promise<ComponentLike | undefined> {
    if (!fn) return;

    assert(`[Bug] Owner is missing`, owner);

    const module = await fn();
    let resolved: ComponentLike | undefined;

    if (typeof module.default === 'string') {
      const state = compileText(owner, module.default);

      resolved = (await state.promise) as ComponentLike | undefined;
    } else {
      resolved = module.default;
    }

    if (resolved) moduleCache.set(path, resolved);

    return resolved;
  }

  const wrapped = getPromiseState(wrapper);

  return wrapped;
}

class Selected {
  @service declare router: RouterService;

  compiledDocs: Record<string, Loader> = {};

  get #docs() {
    return docsManager(this);
  }

  @cached
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
  @use activeCompiled = keepLatest({
    value: () => this.loader,
    when: () => Boolean(this.loader?.isLoading),
  });

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

  @cached
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

  get hasProse() {
    return Boolean(this.prose);
  }

  get #path(): string | undefined {
    if (!this.router.currentURL) return;

    const url = new URL(this.router.currentURL, window.location.origin);
    const path = url.pathname;

    if (path === '/') {
      return;
    }

    return normalizePagePath(path);
  }

  get #matchOrFirstPagePath() {
    return this.#page?.path ?? this.#docs.pages[0]?.path;
  }

  #pageCache = createCache(() => {
    if (!this.#path) return;

    return this.#docs.findByPath(this.#path);
  });

  get #page(): Page | undefined {
    return getValue(this.#pageCache);
  }

  #printError(message: string, error?: unknown) {
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
