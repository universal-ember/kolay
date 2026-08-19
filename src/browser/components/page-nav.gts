import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { hash } from '@ember/helper';
import { service } from '@ember/service';

import { isActive } from '../is-active.ts';
import { docsManager } from '../services/docs.ts';
import { getIndexPage, isIndex, isPageTree } from '../utils.ts';

import type { Page, PageTree } from '../../types.ts';
import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';

const blockWasRenamed = () => {
  assert(
    '<PageNav /> has no `:collection` block. It is now called `:section`, and yields `section` rather than `collection`. See "Upgrading from 5.x" in the migration guide.',
    false
  );
};

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
     * ```gjs live preview
     * import { PageNav } from 'kolay/components';
     * import { nameFor } from '#docs/demo-support';
     *
     * <template>
     *   <PageNav>
     *     <:page as |x|>
     *       <pre>{{JSON.stringify x.page null 3}}</pre>
     *       <page.Link>
     *         {{nameFor x.page}}
     *       </page.Link>
     *     </:page>
     *   </PageNav>
     *   <style>@scope { pre { max-height: 200px; } ul { display: grid; }}</style>
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
     * If provided, this block will yield back the section for customizing the
     * name. By default the `name` property will be used or a link will be
     * rendered if an index page is present..
     *
     * A section is a `PageTree`: the pages under one folder of markdown
     * files, plus any sections nested within it.
     *
     * Example:
     * ```gjs live preview
     * import { PageNav } from 'kolay/components';
     * import { sentenceCase } from '#docs/demo-support';
     *
     * <template>
     *   <PageNav>
     *     <:section as |x|>
     *       <pre>{{JSON.stringify x null 3}}</pre>
     *       {{#if x.index}}
     *         <x.index.Link>
     *           {{sentenceCase x.section.name}}
     *         </x.index.Link>
     *       {{else}}
     *         {{sentenceCase x.section.name}}
     *       {{/if}}
     *     </:section>
     *   </PageNav>
     *   <style>@scope { pre { max-height: 200px; } ul { display: grid; }}</style>
     * </template>
     * ```
     */
    section: [
      {
        section: PageTree;
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
  private get docs() {
    return docsManager(this);
  }

  /**
   * Ember doesn't yet have a way to forward blocks,
   * so we have  to do this weird manualy forwarding ourselves
   *
   * This is extra annoying since Pages is a recursive component.
   */
  <template>
    {{!log this.docs}}
    {{#if (has-block 'collection')}}{{blockWasRenamed}}{{/if}}
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

        <:section as |c|>
          {{#if (has-block 'section')}}
            {{yield c to='section'}}
          {{else}}
            {{#if c.index}}
              <c.index.Link>
                {{c.index.page.name}}
              </c.index.Link>
            {{else}}
              {{c.section.name}}
            {{/if}}
          {{/if}}
        </:section>
      </Pages>
    </nav>
  </template>
}

const not = (x: unknown) => !x;

const Pages: TOC<{
  Args: {
    item: Page | PageTree;
    activeClass?: string;
  };
  Blocks: {
    page: [InternalPageYield];
    section: [
      {
        section: PageTree;
        index?: InternalPageYield;
      },
    ];
  };
}> = <template>
  {{#if (isPageTree @item)}}
    <ul>
      {{#each @item.pages as |page|}}
        {{#if (not (isIndex page))}}
          <li>
            {{#if (isPageTree page)}}

              {{! index.md pages can make the whole section clickable }}
              {{#let (getIndexPage page) as |indexPage|}}
                {{#if indexPage}}
                  {{yield
                    (hash
                      section=page
                      index=(hash
                        page=indexPage
                        Link=(component PageLink item=indexPage activeClass=@activeClass)
                      )
                    )
                    to='section'
                  }}
                {{else}}
                  {{yield (hash section=page) to='section'}}
                {{/if}}
              {{/let}}
            {{/if}}

            <Pages @item={{page}}>
              <:page as |p|>{{yield p to='page'}}</:page>
              <:section as |c|>{{yield c to='section'}}</:section>
            </Pages>
          </li>
        {{/if}}
      {{/each}}
    </ul>
  {{else}}
    {{yield
      (hash page=@item Link=(component PageLink item=@item activeClass=@activeClass))
      to='page'
    }}
  {{/if}}
</template>;

class PageLink extends Component<{
  Element: HTMLAnchorElement;
  Args: {
    item: Page;
    activeClass?: string | undefined;
  };
  Blocks: { default: [page: Page, isActive: boolean] };
}> {
  @service declare router: RouterService;

  get activeClass() {
    return this.args.activeClass ?? 'active';
  }

  get #docs() {
    return docsManager(this);
  }

  /**
   * The page's manifest path — unless its group is mounted via a scoped
   * `addRoutes(context, groupName)`, in which case the mount decides.
   */
  get href() {
    return this.#docs.hrefFor(this.args.item);
  }

  get isActive() {
    const appRelative = this.#docs.appRelativeHrefFor(this.args.item);

    if (appRelative === this.args.item.appRelativePath) {
      return isActive(this.args.item, this.router.currentURL);
    }

    // scoped mount: compare in the mount's URL space
    const [current = ''] = this.router.currentURL?.split(/[?#]/) ?? [];

    return current.replace(/\.md$/, '') === appRelative.replace(/\.md$/, '');
  }

  <template>
    <a href={{this.href}} class={{if this.isActive this.activeClass}} ...attributes>{{yield
        @item
        this.isActive
      }}</a>
  </template>
}
