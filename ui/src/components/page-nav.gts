import Component from '@glimmer/component';
import { service } from '@ember/service';

import type DocsService from '../services/kolay/docs.ts';
import type { Collection, Page } from '../services/kolay/types.ts';
import type RouterService from '@ember/routing/router-service';

export class PageNav extends Component<{
  /**
   * The `<nav>` element. It has a default `aria-label` of "Selected Group".
   * Normally an `aria-label` is not required,
   * but when there are multiple `<nav>` elements on a screen, it is required.
   */
  Element: HTMLElement;
  Args: {
    /**
     * The class to apply to the `<a>` element when its link is active.
     *
     * Defaults to "active"
     */
    activeClass?: string;
  };
  Blocks: {
    /**
     * If provided, this block will yield back the page for customizing the name.
     * By default the `name` property will be used.
     *
     * Example:
     * ```gjs
     * import { PageNav } from 'kolay/components';
     *
     * function toSentenceCase(name) { /* ... \*\/ }
     *
     * <template>
     *   <PageNav>
     *     <:page as |page|>
     *       {{toSentenceCase page.name}}
     *     </:page>
     *   </PageNav>
     * </template>
     * ```
     */
    page: [Page];
    /**
     * If provided, this block will yield back the collection for customizing the name.
     * By default the `name` property will be used.
     *
     * Example:
     * ```gjs
     * import { PageNav } from 'kolay/components';
     *
     * function toSentenceCase(name) { /* ... \*\/ }
     *
     * <template>
     *   <PageNav>
     *     <:collection as |collection|>
     *       {{toSentenceCase collection.name}}
     *     </:collection>
     *   </PageNav>
     * </template>
     * ```
     */
    collection: [Collection];
  };
}> {
  @service('kolay/docs') declare docs: DocsService;

  /**
   * Ember doesn't yet have a way to forward blocks,
   * so we have  to do this weird manualy forwarding ourselves
   *
   * This is extra annoying since Pages is a recursive component.
   */
  <template>
    <nav aria-label='Selected Group' ...attributes>
      <Pages @item={{this.docs.tree}}>

        <:page as |p|>
          {{#if (has-block 'page')}}
            {{yield p to='page'}}
          {{else}}
            {{p.name}}
          {{/if}}
        </:page>

        <:collection as |c|>
          {{#if (has-block 'collection')}}
            {{yield c to='collection'}}
          {{else}}
            {{c.name}}
          {{/if}}
        </:collection>

      </Pages>
    </nav>
  </template>
}

function isCollection(x: Page | Collection): x is Collection {
  return 'pages' in x;
}

class Pages extends Component<{
  Args: { item: Page | Collection; activeClass?: string };
  Blocks: {
    page: [Page];
    collection: [Collection];
  };
}> {
  @service declare router: RouterService;

  get activeClass() {
    return this.args.activeClass ?? 'active';
  }

  isActive = (subPath: string) => {
    if (subPath === '/') return false;

    return this.router.currentURL?.startsWith(subPath);
  };

  <template>
    <ul>
      {{#if (isCollection @item)}}
        {{#each @item.pages as |page|}}
          <li>
            {{#if (isCollection page)}}
              {{yield page to='collection'}}
            {{/if}}

            <Pages @item={{page}}>
              <:page as |p|>{{yield p to='page'}}</:page>
              <:collection as |c|>{{yield c to='collection'}}</:collection>
            </Pages>
          </li>
        {{/each}}
      {{else}}
        <a
          href={{@item.path}}
          class={{if (this.isActive @item.path) this.activeClass}}
        >{{yield @item to='page'}}</a>
      {{/if}}
    </ul>
  </template>
}
