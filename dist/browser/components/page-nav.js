import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { service } from '@ember/service';
import { getIndexPage, isIndex, isCollection } from '../utils.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import { g, i } from 'decorator-transforms/runtime';

class PageNav extends Component {
  static {
    g(this.prototype, "docs", [service('kolay/docs')]);
  }
  #docs = (i(this, "docs"), void 0);
  /**
  * Ember doesn't yet have a way to forward blocks,
  * so we have  to do this weird manualy forwarding ourselves
  *
  * This is extra annoying since Pages is a recursive component.
  */
  static {
    setComponentTemplate(precompileTemplate("\n    <nav aria-label=\"Selected Group\" ...attributes>\n      <Pages @item={{this.docs.tree}}>\n\n        <:page as |p|>\n          {{#if (has-block \"page\")}}\n            {{yield p to=\"page\"}}\n          {{else}}\n            <p.Link>\n              {{p.page.name}}\n            </p.Link>\n          {{/if}}\n        </:page>\n\n        <:collection as |c|>\n          {{#if (has-block \"collection\")}}\n            {{yield c to=\"collection\"}}\n          {{else}}\n            {{#if c.index}}\n              <c.index.Link>\n                {{c.index.page.name}}\n              </c.index.Link>\n            {{else}}\n              {{c.collection.name}}\n            {{/if}}\n          {{/if}}\n        </:collection>\n      </Pages>\n    </nav>\n  ", {
      strictMode: true,
      scope: () => ({
        Pages
      })
    }), this);
  }
}
const not = x => !x;
const Pages = setComponentTemplate(precompileTemplate("\n  {{#if (isCollection @item)}}\n    <ul>\n      {{#each @item.pages as |page|}}\n        {{#if (not (isIndex page))}}\n          <li>\n            {{#if (isCollection page)}}\n\n              {{!-- index.md pages can make the whole collection clickable --}}\n              {{#let (getIndexPage page) as |indexPage|}}\n                {{#if indexPage}}\n                  {{yield (hash collection=page index=(hash page=indexPage Link=(component PageLink item=indexPage activeClass=@activeClass))) to=\"collection\"}}\n                {{else}}\n                  {{yield (hash collection=page) to=\"collection\"}}\n                {{/if}}\n              {{/let}}\n            {{/if}}\n\n            <Pages @item={{page}}>\n              <:page as |p|>{{yield p to=\"page\"}}</:page>\n              <:collection as |c|>{{yield c to=\"collection\"}}</:collection>\n            </Pages>\n          </li>\n        {{/if}}\n      {{/each}}\n    </ul>\n  {{else}}\n    {{yield (hash page=@item Link=(component PageLink item=@item activeClass=@activeClass)) to=\"page\"}}\n  {{/if}}\n", {
  strictMode: true,
  scope: () => ({
    isCollection,
    not,
    isIndex,
    getIndexPage,
    hash,
    PageLink,
    Pages
  })
}), templateOnly());
class PageLink extends Component {
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  get activeClass() {
    return this.args.activeClass ?? 'active';
  }
  get isActive() {
    const subPath = this.args.item.path;
    if (subPath === '/') return false;
    return this.router.currentURL?.startsWith(subPath) ?? false;
  }
  static {
    setComponentTemplate(precompileTemplate("\n    <a href={{@item.path}} class={{if this.isActive this.activeClass}} ...attributes>{{yield @item this.isActive}}</a>\n  ", {
      strictMode: true
    }), this);
  }
}

export { PageNav };
//# sourceMappingURL=page-nav.js.map
