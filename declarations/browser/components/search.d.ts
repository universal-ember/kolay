import './search.css';
import Component from '@glimmer/component';
import type { SearchResult } from '../../types.ts';
import type { ModifierLike } from '@glint/template';
export interface SearchSignature {
    Blocks: {
        /**
         * Replaces the default "Search docs" button. Yielded `open`, and the
         * modifier that returns focus to the trigger when the palette closes.
         * Render nothing in the block to drive the palette with the hotkey alone.
         */
        trigger?: [open: () => void, focusOnClose: ModifierLike<{
            Element: HTMLElement;
        }>];
        /**
         * Replaces the default result: the group, the title, and the excerpt.
         * Yielded the result, and the query that found it.
         */
        result?: [result: SearchResult, query: string];
    };
}
/**
 * Site-wide search, as a command palette.
 *
 * There is nothing to index and nothing to configure: the `docs()` plugin
 * already wrote every page's title, headings, and prose into the compiled
 * docs, and this renders what [`searcher`](/Runtime/utilities/search.md)
 * ranks.
 *
 * ```gjs
 * import { Search } from 'kolay/components';
 *
 * <template>
 *   <Search />
 * </template>
 * ```
 *
 * The palette is `<CommandPalette>` from `ember-primitives`: a `<dialog>`
 * for the layer and the focus, and `aria-activedescendant` for the keyboard.
 */
export declare class Search extends Component<SearchSignature> {
    query: string;
    get trimmed(): string;
    /**
     * `@cached` so the search runs once per query rather than once per access:
     * `getPromiseState` keys its state off the promise it is handed, and a new
     * promise each time would mean a new pending state each time.
     */
    get search(): Promise<SearchResult[]>;
    get state(): import("reactiveweb/get-promise-state").State<SearchResult[]>;
    get total(): number;
    get results(): SearchResult[];
    /**
     * What the listbox is doing, in words -- the part of a combobox a screen
     * reader is not told by the options themselves.
     */
    get status(): string;
    setQuery: (query: string) => void;
    excerpt: (result: SearchResult) => string;
    /** Clearing is for carrying on typing, so the caret goes back to the input. */
    clear: (setQuery: (query: string) => void, event: MouseEvent) => void;
}
export default Search;
//# sourceMappingURL=search.d.ts.map