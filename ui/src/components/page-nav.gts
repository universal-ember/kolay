import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { service } from '@ember/service';

import { getIndexPage, isCollection, isIndex } from '../utils.ts';

import type DocsService from '../services/kolay/docs.ts';
import type { Collection, Page } from '../services/kolay/types.ts';
import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';

type InternalPageYield = {
  page: Page;
  Link: ComponentLike<{
    Element: HTMLAnchorElement;
    Blocks: { default: [page: Page, isActive: boolean] };
  }>;
};

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
     * If provided, this block will yield back the page for customizing the name and element.
     * By default the `name` property will be used in a link.
     *
     * Example:
     * ```gjs
     * import { PageNav } from 'kolay/components';
     *
     * function toSentenceCase(name) { /* ... *\/ }
     *
     * <template>
     *   <PageNav>
     *     <:page as |page|>
     *       <x.Link>
     *         {{toSentenceCase page.name}}
     *       </x.Link>
     *     </:page>
     *   </PageNav>
     * </template>
     * ```
     */
    page: [
      {
        page: Page;
        Link: ComponentLike<{
          Element: HTMLAnchorElement;
          Blocks: { default: [page: Page, isActive: boolean] };
        }>;
      },
    ];
    /**
     * If provided, this block will yield back the collection for customizing the name.
     * By default the `name` property will be used or a link will be rendered if an index page is present..
     *
     * Example:
     * ```gjs
     * import { PageNav } from 'kolay/components';
     *
     * function toSentenceCase(name) { /* ... *\/ }
     *
     * <template>
     *   <PageNav>
     *     <:collection as |x|>
     *       {{#if x.index}}
     *         <x.index.Link>
     *           {{sentenceCase x.collection.name}}
     *         </x.index.Link>
     *       {{else}}
     *         {{sentenceCase x.collection.name}}
     *       {{/if}}
     *     </:collection>
     *   </PageNav>
     * </template>
     * ```
     */
    collection: [
      {
        collection: Collection;
        /**
         * If there is an index page, it'll be provided here,
         * and omitted from the :page block.
         */
        index?: {
          page: Page;
          Link: ComponentLike<{
            Element: HTMLAnchorElement;
            Blocks: { default: [page: Page, isActive: boolean] };
          }>;
        };
      },
    ];
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
            <p.Link>
              {{p.page.name}}
            </p.Link>
          {{/if}}
        </:page>

        <:collection as |c|>
          {{#if (has-block 'collection')}}
            {{yield c to='collection'}}
          {{else}}
            {{#if c.index}}
              <c.index.Link>
                {{c.index.page.name}}
              </c.index.Link>
            {{else}}
              {{c.collection.name}}
            {{/if}}
          {{/if}}
        </:collection>
      </Pages>
    </nav>
  </template>
}

const not = (x: unknown) => !x;

const Pages: TOC<{
  Args: {
    item: Page | Collection;
    activeClass?: string;
  };
  Blocks: {
    page: [InternalPageYield];
    collection: [
      {
        collection: Collection;
        index?: InternalPageYield;
      },
    ];
  };
}> = <template>
  {{#if (isCollection @item)}}
    <ul>
      {{#each @item.pages as |page|}}
        {{#if (not (isIndex page))}}
          <li>
            {{#if (isCollection page)}}

              {{! index.md pages can make the whole collection clickable }}
              {{#let (getIndexPage page) as |indexPage|}}
                {{#if indexPage}}
                  {{yield
                    (hash
                      collection=page
                      index=(hash
                        page=indexPage
                        Link=(component
                          PageLink item=indexPage activeClass=@activeClass
                        )
                      )
                    )
                    to='collection'
                  }}
                {{else}}
                  {{yield (hash collection=page) to='collection'}}
                {{/if}}
              {{/let}}
            {{/if}}

            <Pages @item={{page}}>
              <:page as |p|>{{yield p to='page'}}</:page>
              <:collection as |c|>{{yield c to='collection'}}</:collection>
            </Pages>
          </li>
        {{/if}}
      {{/each}}
    </ul>
  {{else}}
    {{yield
      (hash
        page=@item Link=(component PageLink item=@item activeClass=@activeClass)
      )
      to='page'
    }}
  {{/if}}
</template>;

class PageLink extends Component<{
  Element: HTMLAnchorElement;
  Args: {
    item: Page;
    activeClass?: string;
  };
  Blocks: { default: [page: Page, isActive: boolean] };
}> {
  @service declare router: RouterService;

  get activeClass() {
    return this.args.activeClass ?? 'active';
  }

  get isActive() {
    let subPath = this.args.item.path;

    if (subPath === '/') return false;

    return this.router.currentURL?.startsWith(subPath) ?? false;
  }

  <template>
    <a
      href={{@item.path}}
      class={{if this.isActive this.activeClass}}
      ...attributes
    >{{yield @item this.isActive}}</a>
  </template>
}
