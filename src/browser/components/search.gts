import './search.css';

import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

import { CommandPalette } from 'ember-primitives/components/command-palette';
import { Modal } from 'ember-primitives/components/dialog';
import { KeyCombo } from 'ember-primitives/components/keys';
import { getPromiseState } from 'reactiveweb/get-promise-state';

import { searcher } from '../services/search.ts';
import { highlightSearch } from '../services/search/highlight.ts';
import { stripFormatting } from '../services/search/strip-formatting.ts';

import type { SearchResult } from '../../types.ts';
import type { TOC } from '@ember/component/template-only';
import type { ModifierLike } from '@glint/template';

const DEFAULT_HOTKEY = 'mod+k';
const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_LIMIT = 20;

/**
 * The keys of a hotkey, as `<KeyCombo>` wants them. `mod` is a different key
 * on macOS than everywhere else, so it is spelled twice.
 */
function keysFor(hotkey: string, mod: string) {
  return hotkey
    .split('+')
    .map((key) => key.trim())
    .map((key) => (key.toLowerCase() === 'mod' ? mod : key.toUpperCase()));
}

const MagnifyingGlass: TOC<{ Element: SVGElement }> = <template>
  <svg
    class='kolay__search__icon'
    aria-hidden='true'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    stroke-width='2'
    stroke-linecap='round'
    ...attributes
  ><circle cx='11' cy='11' r='6.5' /><path d='m16 16 5 5' /></svg>
</template>;

export interface SearchSignature {
  Args: {
    /**
     * The key combination that opens the palette from anywhere on the page.
     *
     * Defaults to `"mod+k"` -- <kbd>⌘</kbd><kbd>K</kbd> on macOS and
     * <kbd>Ctrl</kbd><kbd>K</kbd> everywhere else. Pass an empty string to
     * install no global listener at all.
     */
    hotkey?: string;
    /**
     * How much the reader has to type before the index is consulted.
     *
     * Defaults to 3. One or two characters match most of a docs site, which
     * is the same as matching none of it.
     */
    minLength?: number;
    /**
     * How many results to render.
     *
     * Defaults to 20. Ranking already puts the answer near the top, and a
     * palette that renders every page of a large site renders mostly noise.
     */
    limit?: number;
    /**
     * The input's placeholder.
     */
    placeholder?: string;
  };
  Blocks: {
    /**
     * Replaces the default "Search docs" button. Yielded `open`, and the
     * modifier that returns focus to the trigger when the palette closes.
     * Render nothing in the block to drive the palette with the hotkey alone.
     */
    trigger?: [open: () => void, focusOnClose: ModifierLike<{ Element: HTMLElement }>];
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
export class Search extends Component<SearchSignature> {
  @tracked query = '';

  get hotkey() {
    return this.args.hotkey ?? DEFAULT_HOTKEY;
  }

  get minLength() {
    return this.args.minLength ?? DEFAULT_MIN_LENGTH;
  }

  get limit() {
    return this.args.limit ?? DEFAULT_LIMIT;
  }

  get hotkeyKeys() {
    return keysFor(this.hotkey, 'Ctrl');
  }

  get hotkeyMacKeys() {
    return keysFor(this.hotkey, '⌘');
  }

  get trimmed() {
    return this.query.trim();
  }

  /**
   * `@cached` so the search runs once per query rather than once per access:
   * `getPromiseState` keys its state off the promise it is handed, and a new
   * promise each time would mean a new pending state each time.
   */
  @cached
  get search(): Promise<SearchResult[]> {
    if (this.trimmed.length < this.minLength) return Promise.resolve([]);

    return searcher(this).search(this.query);
  }

  get state() {
    return getPromiseState(this.search);
  }

  get total() {
    return this.state.resolved?.length ?? 0;
  }

  get results() {
    return this.state.resolved?.slice(0, this.limit) ?? [];
  }

  /**
   * What the listbox is doing, in words -- the part of a combobox a screen
   * reader is not told by the options themselves.
   */
  get status() {
    if (!this.trimmed) return 'Search every guide, reference page, heading, and paragraph.';

    if (this.trimmed.length < this.minLength) {
      return `Type at least ${this.minLength} characters.`;
    }

    if (this.state.isLoading) return 'Searching…';
    if (this.total === 0) return `No results for “${this.trimmed}”.`;
    if (this.total > this.limit) return `Showing ${this.limit} of ${this.total} results.`;

    return this.total === 1 ? '1 result.' : `${this.total} results.`;
  }

  setQuery = (query: string) => {
    this.query = query;
  };

  excerpt = (result: SearchResult) => stripFormatting(result.text, result.excerptRange);

  <template>
    <Modal as |m|>
      {{#if (has-block 'trigger')}}
        {{yield m.open m.focusOnClose to='trigger'}}
      {{else}}
        <button
          type='button'
          class='kolay__search__trigger'
          {{m.focusOnClose}}
          {{on 'click' m.open}}
        >
          <MagnifyingGlass />
          <span>Search docs</span>
          {{#if this.hotkey}}
            <KeyCombo @keys={{this.hotkeyKeys}} @mac={{this.hotkeyMacKeys}} />
          {{/if}}
        </button>
      {{/if}}

      <m.Dialog class='kolay__search'>
        <CommandPalette
          @hotkey={{this.hotkey}}
          @onOpen={{m.open}}
          @onSelect={{m.close}}
          @onQueryChange={{this.setQuery}}
          as |c|
        >
          <div class='kolay__search__field'>
            <MagnifyingGlass />
            <c.Input
              class='kolay__search__input'
              aria-label='Search docs'
              placeholder={{if @placeholder @placeholder 'Search titles, headings, and prose…'}}
            />
          </div>

          <c.List class='kolay__search__results' as |l|>
            {{#each this.results key='path' as |result|}}
              <l.LinkItem class='kolay__search__result' @href={{result.path}}>
                {{#if (has-block 'result')}}
                  {{yield result this.query to='result'}}
                {{else}}
                  <p class='kolay__search__result__group'>{{result.groupName}}</p>
                  <h2 class='kolay__search__result__title'>{{result.title}}</h2>
                  <p
                    class='kolay__search__result__excerpt'
                    {{highlightSearch this.query}}
                  >{{this.excerpt result}}</p>
                {{/if}}
              </l.LinkItem>
            {{/each}}
          </c.List>

          <p class='kolay__search__status' role='status'>{{this.status}}</p>
        </CommandPalette>
      </m.Dialog>
    </Modal>
  </template>
}

export default Search;
