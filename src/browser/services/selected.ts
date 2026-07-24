import { cached } from '@glimmer/tracking';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { service } from '@ember/service';

import { createStore } from 'ember-primitives/store';

import { compiledDoc } from './compiled-doc.ts';
import { docsManager } from './docs.ts';
import { getKey } from './lazy-load.ts';

import type { Page } from '../../types.ts';
import type { CompiledDoc } from './compiled-doc.ts';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';

export function selected(context: unknown) {
  const owner = getKey(context);

  return createStore(owner, Selected);
}

type File = { default: string | ComponentLike };
type Loader = () => Promise<File>;

class Selected {
  @service declare router: RouterService;

  compiledDocs: Record<string, Loader> = {};

  get #docs() {
    return docsManager(this);
  }

  #doc: CompiledDoc | undefined;

  /**
   * The load / compile / error state for the current page's document.
   *
   * (Lazily created, because while this store is being constructed,
   *  it does not have an owner yet)
   */
  get doc(): CompiledDoc {
    return (this.#doc ??= compiledDoc(this, () => {
      const path = this.#matchOrFirstPagePath;

      if (!path) return;

      /**
       * NOTE: we support paths with and withouth the '.md' on the URL
       */
      const fn = this.compiledDocs[path] ?? this.compiledDocs[path + '.md'];

      return fn?.();
    }));
  }

  get prose() {
    if (this.error) {
      return;
    }

    return this.doc.prose;
  }

  get isReady() {
    return this.doc.isReady;
  }

  get isPending() {
    return !this.isReady;
  }

  get hasError() {
    if (this.error) {
      return Boolean(this.error);
    }

    return this.doc.hasError;
  }

  @cached
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

  get hasProse() {
    return Boolean(this.prose);
  }

  get #path(): string | undefined {
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
