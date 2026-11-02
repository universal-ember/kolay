import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { assert } from '@ember/debug';
import { waitForPromise } from '@ember/test-waiters';

import { getPromiseState } from 'reactiveweb/get-promise-state';

import { compileText } from './compiler/reactive.ts';
import { extractErrorMessage } from './extract-error-message.ts';
import { getKey } from './lazy-load.ts';

import type { ComponentLike } from '@glint/template';
import type { State } from 'reactiveweb/get-promise-state';

/**
 * A module containing a document, e.g. the result of `import('/some-doc.md?raw')`
 * or of a compiled `.gjs.md` module.
 */
export type DocModule = { default: string | ComponentLike };

/**
 * What a document may be loaded as:
 * - a string of markdown (compiled in the browser)
 * - an already-compiled component (e.g.: the module of a build-time-compiled `.gjs.md` file)
 * - a module whose default export is either of the above
 */
export type DocSource = string | ComponentLike | DocModule;

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
export function compiledDoc(load: () => DocSource | Promise<DocSource> | undefined): CompiledDoc {
  return new CompiledDoc(load);
}

function isDocModule(source: DocSource): source is DocModule {
  return typeof source === 'object' && source !== null && 'default' in source;
}

export class CompiledDoc {
  #load: () => DocSource | Promise<DocSource> | undefined;

  constructor(load: () => DocSource | Promise<DocSource> | undefined) {
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
    const owner = getKey(this);

    assert(`[Bug] Owner is missing`, owner);

    const resolve = async (): Promise<ComponentLike | undefined> => {
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
      waitForPromise(resolve())
    );
  });

  get #state() {
    return getValue(this.#stateCache);
  }

  #previousState: State<ComponentLike | undefined> | undefined;

  /*********************************************************************
   * This is a pattern to help reduce flashes of content during
   * the intermediate states of the above request fetchers.
   * When a new request starts, we'll hold on the old value for as long as
   * we can, and only swap out the old data when the new data is done loading.
   *
   * (reading `isLoading` entangles this getter with the request's
   *  progress, so consumers re-render when loading finishes)
   ********************************************************************/
  get latest(): State<ComponentLike | undefined> | undefined {
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
  get prose(): ComponentLike | undefined {
    if (this.hasError) {
      return;
    }

    return this.latest?.resolved;
  }

  get isReady(): boolean {
    return Boolean(this.latest?.resolved);
  }

  get isPending(): boolean {
    return !this.isReady;
  }

  /**
   * The raw error from loading or compiling, if there was one.
   * See `error` for a human-readable message.
   */
  get rawError(): unknown {
    return this.latest?.error;
  }

  /**
   * A human-readable message extracted from `rawError`
   * (may be `''` when the raw error has no extractable message).
   */
  get error(): string {
    return extractErrorMessage(this.rawError);
  }

  get hasError(): boolean {
    return Boolean(this.rawError);
  }
}
