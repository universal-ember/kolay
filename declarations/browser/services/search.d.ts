import type { SearchEntry, SearchResult } from '../../types.ts';
export declare function searcher(context: unknown): SearchService;
export declare class SearchService {
    #private;
    private router;
    /**
     * @internal
     */
    _loadSearchData: (() => Promise<SearchEntry[]>) | undefined;
    /**
     * Rank every page against a query.
     *
     * Async because the index is: the manifest, and then the text of any page
     * the build couldn't inline. Both are loaded once and kept, so only the
     * first search waits — and the awaiting belongs to whatever renders the
     * results, which has to describe a pending search anyway.
     */
    search: (query: string) => Promise<SearchResult[]>;
    loadSearchData: () => Promise<SearchEntry[]>;
}
//# sourceMappingURL=search.d.ts.map