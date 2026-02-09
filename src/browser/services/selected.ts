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

const CACHE = new Map<string, ReturnType<typeof getPromiseState<ComponentLike | undefined>>>();

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
function loaderFor(selected: Selected, path: string | undefined) {
  if (!path) return;

  const existing = CACHE.get(path);

  if (existing) return existing;

  const docs = selected.compiledDocs;
  const owner = getOwner(selected);

  /**
   * NOTE: we support paths with and withouth the '.md' on the URL
   */
  const fn = docs[path] ?? docs[path + '.md'];

  async function wrapper(): Promise<ComponentLike | undefined> {
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
  @service declare router: RouterService;

  compiledDocs: Record<string, Loader> = {};

  get #docs() {
    return docsManager(this);
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
  @use activeCompiled = keepLatest({
    value: () => this.#loader,
    when: () => Boolean(this.#loader?.isLoading),
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

    const error = this.activeCompiled?.error ? String(this.activeCompiled?.error) : '';

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
