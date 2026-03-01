import Component from '@glimmer/component';
import { service } from '@ember/service';
import { d as docsManager, s as selected, g as getIndexPage, i as isIndex, a as isCollection } from './utils-BQ_38CuW.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i } from 'decorator-transforms/runtime';
import { registerDestructor } from '@ember/destroyable';
import { Scroller } from 'ember-primitives/components/scroller';
import { TrackedArray } from 'tracked-built-ins';
import templateOnly from '@ember/component/template-only';
import { hash } from '@ember/helper';

class GroupNav extends Component {
  get #docs() {
    return docsManager();
  }
  static {
    g(this.prototype, "router", [service]);
  }
  #router = (i(this, "router"), void 0);
  get homeName() {
    return this.args.homeName ?? 'Home';
  }
  get rootURL() {
    return this.router.rootURL;
  }
  get groups() {
    return this.#docs.availableGroups.map(groupName => {
      if (groupName === 'root') return {
        text: this.homeName,
        value: '/'
      };
      return {
        text: groupName,
        value: groupName
      };
    });
  }
  isActive = subPath => {
    if (subPath === '/') return false;
    return this.router.currentURL?.startsWith(subPath);
  };
  get activeClass() {
    return this.args.activeClass ?? 'active';
  }
  static {
    setComponentTemplate(precompileTemplate("<nav aria-label=\"Groups\" ...attributes>\n  <ul>\n    {{#each this.groups as |group|}}\n      <li>\n        <a href=\"{{this.rootURL}}{{group.value}}\" class={{if (this.isActive group.value) this.activeClass}}>\n\n          {{#if (has-block)}}\n            {{yield group.text}}\n          {{else}}\n            {{group.text}}\n          {{/if}}\n\n        </a>\n      </li>\n    {{/each}}\n  </ul>\n</nav>", {
      strictMode: true
    }), this);
  }
}

/* eslint-disable no-console */
const original = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  info: console.info
};
const LEVELS = Object.keys(original);
const formatter = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 2
});
const format = date => formatter.format(date);
const LogList = setComponentTemplate(precompileTemplate("<Scroller class=\"kolay__log-list__scroll\" as |x|>\n  {{#each @logs as |logEntry|}}\n    <div class=\"kolay__log-list__level {{logEntry.level}}\">\n      <span class=\"kolay__log-list__time\">{{format logEntry.timestamp}}</span>\n      <span>{{logEntry.message}}</span>\n    </div>\n    {{(x.scrollToBottom)}}\n  {{/each}}\n</Scroller>\n\n{{!-- prettier-ignore-start --}}\n<style>\n  .kolay__log-list__scroll {\n    position: relative;\n    overflow: auto;\n    max-height: 10rem;\n    filter: invert(1);\n    .kolay__log-list__level {\n      display: flex;\n      gap: 0.5rem;\n    }\n    .kolay__log-list__time {\n      border-right: 1px solid;\n      padding-right: 0.5rem;\n    }\n  }\n</style>\n{{!-- prettier-ignore-end --}}", {
  strictMode: true,
  scope: () => ({
    Scroller,
    format
  })
}), templateOnly());
class Logs extends Component {
  logs = new TrackedArray();
  constructor(...args) {
    super(...args);
    registerDestructor(this, () => LEVELS.forEach(level => console[level] = original[level]));
    for (const level of LEVELS) {
      console[level] = (...messageParts) => {
        // If our thing fails, we want the normal
        // log to still happen, just in case.
        // Makes debugging easier
        original[level](...messageParts);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          // We need to await here, so
          // we don't break {{log thing}} usage
          await Promise.resolve();
          this.logs.push({
            level,
            message: messageParts.join(' '),
            timestamp: new Date()
          });
        })();
      };
    }
  }
  static {
    setComponentTemplate(precompileTemplate("<div class=\"kolay__in-viewport__logs\">\n  <LogList @logs={{this.logs}} />\n</div>\n{{!-- prettier-ignore-start --}}\n<style>\n  .kolay__in-viewport__logs {\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    padding: 0.5rem;\n    border: 1px solid gray;\n    background: currentColor;\n    filter: invert(1);\n  }\n</style>\n{{!-- prettier-ignore-end --}}", {
      strictMode: true,
      scope: () => ({
        LogList
      })
    }), this);
  }
}

class Page extends Component {
  static {
    setComponentTemplate(precompileTemplate("{{#if this.selected.hasError}}\n  {{yield this.selected.error to=\"error\"}}\n{{/if}}\n\n{{#if this.selected.isPending}}\n  {{yield to=\"pending\"}}\n{{/if}}\n\n{{#if this.selected.prose}}\n  {{yield this.selected.prose to=\"success\"}}\n{{/if}}", {
      strictMode: true
    }), this);
  }
  get selected() {
    return selected();
  }
}

class PageNav extends Component {
  get docs() {
    return docsManager();
  }
  /**
  * Ember doesn't yet have a way to forward blocks,
  * so we have  to do this weird manualy forwarding ourselves
  *
  * This is extra annoying since Pages is a recursive component.
  */
  static {
    setComponentTemplate(precompileTemplate("{{!--log this.docs--}}\n<nav aria-label=\"Selected Group\" ...attributes>\n  <Pages @item={{this.docs.tree}}>\n\n    <:page as |p|>\n      {{#if (has-block \"page\")}}\n        {{yield p to=\"page\"}}\n      {{else}}\n        <p.Link>\n          {{p.page.name}}\n        </p.Link>\n      {{/if}}\n    </:page>\n\n    <:collection as |c|>\n      {{#if (has-block \"collection\")}}\n        {{yield c to=\"collection\"}}\n      {{else}}\n        {{#if c.index}}\n          <c.index.Link>\n            {{c.index.page.name}}\n          </c.index.Link>\n        {{else}}\n          {{c.collection.name}}\n        {{/if}}\n      {{/if}}\n    </:collection>\n  </Pages>\n</nav>", {
      strictMode: true,
      scope: () => ({
        Pages
      })
    }), this);
  }
}
const not = x => !x;
const Pages = setComponentTemplate(precompileTemplate("{{#if (isCollection @item)}}\n  <ul>\n    {{#each @item.pages as |page|}}\n      {{#if (not (isIndex page))}}\n        <li>\n          {{#if (isCollection page)}}\n\n            {{!-- index.md pages can make the whole collection clickable --}}\n            {{#let (getIndexPage page) as |indexPage|}}\n              {{#if indexPage}}\n                {{yield (hash collection=page index=(hash page=indexPage Link=(component PageLink item=indexPage activeClass=@activeClass))) to=\"collection\"}}\n              {{else}}\n                {{yield (hash collection=page) to=\"collection\"}}\n              {{/if}}\n            {{/let}}\n          {{/if}}\n\n          <Pages @item={{page}}>\n            <:page as |p|>{{yield p to=\"page\"}}</:page>\n            <:collection as |c|>{{yield c to=\"collection\"}}</:collection>\n          </Pages>\n        </li>\n      {{/if}}\n    {{/each}}\n  </ul>\n{{else}}\n  {{yield (hash page=@item Link=(component PageLink item=@item activeClass=@activeClass)) to=\"page\"}}\n{{/if}}", {
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
    setComponentTemplate(precompileTemplate("<a href={{@item.path}} class={{if this.isActive this.activeClass}} ...attributes>{{yield @item this.isActive}}</a>", {
      strictMode: true
    }), this);
  }
}

export { GroupNav, Logs, Page, PageNav };
//# sourceMappingURL=components.js.map
