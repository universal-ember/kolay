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
  const trimmed = path.replace(/\.md$/, '');

  if (moduleCache.has(trimmed)) return;

  // The virtual module is provided by kolay's vite/webpack plugin in the
  // consumer's build, so this resolves at runtime through the bundler.
  const mod = (await import(/* @vite-ignore */ 'kolay/compiled-docs:virtual' as string)) as {
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

    return path?.replace(/\.md$/, '');
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
