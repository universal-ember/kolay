import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

import { use } from 'ember-resources';
import { keepLatest } from 'reactiveweb/keep-latest';
import { RemoteData } from 'reactiveweb/remote-data';

import type DocsService from './docs';
import { getOwner } from '@ember/owner';

export const OUTPUT_PREFIX = `/docs/`;
export const OUTPUT_PREFIX_REGEX = /^\/docs\//;

/**
 * With how data is derived here, the `fetch` request does not execute
 * if we know ahead of time that the fetch would fail.
 * e.g.: when the URL is not declared in the manifest.
 *
 * The `fetch` only occurs when `last` is accessd.
 * and `last` is not accessed if `doesPageExist` is ever false.
 */
export class MDRequest {
  constructor(private urlFn: () => string) {}

  @service('kolay/docs') declare docs: DocsService;

  get config() {
    // @ts-ignore
    return getOwner(this).resolveRegistration('config:environment')
  }

  /**
   * TODO: use a private property when we move to spec-decorators
   */
  @use last = RemoteData<string>(this.urlFn);

  @use lastSuccessful = keepLatest({
    value: () => this.#lastValue,
    when: () => this.hasError,
  });

  get hasError() {
    if (!this._doesPageExist) return true;

    /**
     * Can't have an error if we haven't made a request yet
     */
    if (!this.last.status) return false;

    return this.last.status >= 400;
  }

  /**
   * TODO: use a private property when we move to spec-decorators
   */
  @cached
  private get _doesPageExist() {
    let url = this.urlFn();
    let pagePath = url
      .slice(this.config.rootURL.length - 1)
      .replace(OUTPUT_PREFIX_REGEX, '/');
    let group = this.docs.groupForURL(pagePath);

    return Boolean(group);
  }

  get #lastValue() {
    if (!this._doesPageExist) return '';

    return this.last.value;
  }
}
