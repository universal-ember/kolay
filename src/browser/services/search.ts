import { service } from '@ember/service';

import { createStore } from 'ember-primitives/store';

import { getKey } from './lazy-load.ts';
import { rankSearch } from './search/rank-search.ts';
import { selected } from './selected.ts';

import type { SearchEntry, SearchResult } from '../../types.ts';
import type RouterService from '@ember/routing/router-service';

export function searcher(context: unknown) {
  const owner = getKey(context);

  return createStore(owner, SearchService);
}

export class SearchService {
  @service declare private router: RouterService;

  /**
   * @internal
   */
  _loadSearchData: (() => Promise<SearchEntry[]>) | undefined;
  #searchDataPromise?: Promise<SearchEntry[]>;

  get #selected() {
    return selected(this);
  }

  /**
   * Rank every page against a query.
   *
   * Async because the index is: the manifest, and then the text of any page
   * the build couldn't inline. Both are loaded once and kept, so only the
   * first search waits — and the awaiting belongs to whatever renders the
   * results, which has to describe a pending search anyway.
   */
  search = async (query: string): Promise<SearchResult[]> => {
    return rankSearch(await this.#searchEntries(), query);
  };

  loadSearchData = (): Promise<SearchEntry[]> => {
    return (this.#searchDataPromise ??= this._loadSearchData?.() ?? Promise.resolve([]));
  };

  /**
   * Where a page's markdown is deployed: the app's rootURL over the page's
   * own manifest-space path. Deployment layout, not routing — a group mounted
   * at some other URL by `addRoutes(context, groupName)` still has its file
   * where the manifest put it.
   */
  #sourceUrlFor(entry: SearchEntry): string {
    const base = this.router.rootURL ?? '/';
    const path = entry.appRelativePath.replace(/^\//, '');
    const url = `${base.endsWith('/') ? base : `${base}/`}${path}`;

    return url.endsWith('.md') ? url : `${url}.md`;
  }

  /**
   * The index: every entry with its text, however that text had to be got.
   * Cached as the promise, so concurrent searches share one load.
   */
  async #searchEntries(): Promise<SearchEntry[]> {
    const entries = await this.loadSearchData();

    return Promise.all(
      entries.map(async (entry) => {
        if (entry.text) return entry;

        // one unreadable page is not a failed search
        const text = await this.#searchTextFor(entry).catch(() => '');

        return { ...entry, text };
      })
    );
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
  async #searchTextFor(entry: SearchEntry): Promise<string> {
    // the manifest is inconsistent about the extension, so both spellings are
    // tried — the same lookup the selected store does
    const loaders = this.#selected.compiledDocs;
    const loader = loaders[entry.path] ?? loaders[`${entry.path}.md`];

    if (loader) {
      const module = await loader();

      return typeof module.default === 'string' ? module.default : '';
    }

    const response = await fetch(this.#sourceUrlFor(entry));

    // A path that was never deployed is answered with the app's own
    // index.html by every SPA host, at 200 — indexing that would match every
    // page in the site on the markup around its pages.
    if (!response.ok) return '';
    if (response.headers.get('content-type')?.includes('html')) return '';

    return response.text();
  }
}
