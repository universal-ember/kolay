import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

import { modifier } from 'ember-modifier';
import { Form } from 'ember-primitives/components/form';
import { highlightSearch, searcher, stripFormatting } from 'kolay';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { getTabsterAttribute, MoverDirections } from 'tabster';

import type RouterService from '@ember/routing/router-service';
import type { SearchResult } from 'kolay';

interface Signature {
  Args: {
    model: { query: string };
  };
}

/**
 * The results are one list to arrow through: up/down moves between them, and
 * Tab leaves the list rather than walking all 40 of them. Each result holds a
 * single focusable — the link stretched over the card.
 */
const RESULTS_MOVER = getTabsterAttribute(
  {
    mover: {
      direction: MoverDirections.Vertical,
      cyclic: true,
    },
  },
  true
);

const autofocus = modifier((element: HTMLElement) => {
  // `preventScroll`: the search box is sticky at the top of a long list, and
  // focusing it must not scroll the results out from under the reader
  element.focus({ preventScroll: true });
});

export default class SearchPage extends Component<Signature> {
  @service declare router: RouterService;

  get query(): string {
    return String(this.router.currentRoute?.queryParams?.q);
  }

  /**
   * `@cached` so the search runs once per query rather than once per access:
   * `getPromiseState` keys its state off the promise it is handed, and a new
   * promise each time would mean a new pending state each time.
   */
  @cached
  get search(): Promise<SearchResult[]> {
    if (this.query.length < 3) return Promise.resolve([]);

    return searcher(this).search(this.query);
  }

  get results() {
    return getPromiseState(this.search).resolved ?? [];
  }

  submit = (data: { q?: string }) => {
    const q = data.q ?? '';

    this.router.transitionTo('search', { queryParams: { q } });
  };

  <template>
    <section>
      <h1>Search the docs</h1>
      <Form data-search @onChange={{this.submit}}>
        <input
          aria-label="Search documentation"
          autocomplete="off"
          name="q"
          value={{this.query}}
          placeholder="Search titles, headings, and prose…"
          {{autofocus}}
        />
        <button type="submit">Search</button>
      </Form>

      {{#if this.results.length}}
        <br />
        <p>{{this.results.length}} results for <strong>“{{this.query}}”</strong></p>
        <div data-tabster={{RESULTS_MOVER}}>
          {{#each this.results as |result|}}
            {{! the result is the link: one focusable per card, and the whole
                card is the target without an overlay faking it }}
            <a class="search-result" data-search-result href={{result.path}}>
              <p>{{result.groupName}}</p>
              <h2>{{result.title}}</h2>
              <div class="search-result__excerpt" data-excerpt>
                <p {{highlightSearch this.query}}>{{stripFormatting
                    result.text
                    result.excerptRange
                  }}</p>
              </div>
            </a>
          {{/each}}
        </div>
      {{else}}
        <br />
        <p>Search across every guide, reference page, heading, and paragraph.</p>
      {{/if}}

    </section>

    <style scoped>
      [data-search] {
        /* results are long; the box you type in stays reachable. The site
         * header scrolls away, so the viewport's top is the right edge. */
        position: sticky;
        top: 0;
        z-index: 1;
        padding-block: 0.75rem;
        background: var(--pico-background-color);
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.75rem;
        align-items: stretch;

        input {
          display: block;
          min-width: 0;
          width: 100%;
          margin: 0;
        }

        button {
          display: block;
          width: auto;
          min-width: 7rem;
          margin: 0;
        }
      }

      section {
        max-width: 58rem;
      }

      /* The card is the link. Undoing pico's anchor styling needs to outrank
       * its `a:is([href], …):is(:hover, …)` selectors, so that — and the
       * hovered border — live in app.css under `[data-search-result]`. */
      .search-result {
        display: block;
        position: relative;
        /* not `overflow: hidden`: the lit border sits on the border band and
         * blooms past it, and clipping would cut both off */
        margin: 0.75rem 0;
        padding: 0.85rem 1rem;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 0.45rem;
        line-height: 1.4;

        &:focus-visible {
          outline: 2px solid var(--pico-primary);
          outline-offset: 2px;
        }

        /* the title still reads as the link, since the card is one */
        h2 {
          color: var(--pico-primary);
        }

        &:hover h2 {
          text-decoration: underline;
        }

        /* the group label and the excerpt are the card's own children — the
         * child combinator keeps these off the paragraphs inside an excerpt */
        > p:first-child {
          position: absolute;
          top: 0.85rem;
          right: 1rem;
          margin: 0;
          color: var(--pico-muted-color);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        > p:last-child {
          max-width: calc(100% - 8rem);
          margin: 0;
          color: var(--pico-muted-color);
          font-size: 0.9rem;
          line-height: 1.4;
        }
        h2 {
          max-width: 70%;
          margin: 0 0 0.35rem;
          font-size: 1.1rem;
          line-height: 1.25;
        }
      }

      .search-result__excerpt {
        display: -webkit-box;
        overflow: hidden;
        /* the clamp below is the box's maximum; holding the same two lines as
         * a min as well makes every card the same height, whatever its
         * excerpt turned out to be */
        min-height: 2lh;
        max-height: 2lh;
        max-width: calc(100% - 8rem);
        color: var(--pico-muted-color);
        font-size: 0.9rem;
        line-height: 1.4;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;

        p {
          margin: 0;
        }
      }
      ::highlight(search-query) {
        background: color-mix(in oklab, var(--pico-primary), transparent 65%);
        color: var(--pico-color);
        text-decoration: underline;
        text-decoration-color: var(--pico-primary);
        text-decoration-thickness: 0.12em;
        text-underline-offset: 0.14em;
      }
    </style>
  </template>
}
