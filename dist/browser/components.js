import Component from '@glimmer/component';
import { service } from '@ember/service';
import { d as docsManager, H as HOME_GROUP, s as selected, g as getIndexPage, i as isIndex, a as isPageTree, b as searcher } from './docs-CGM7i59Z.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i, n } from 'decorator-transforms/runtime';
import { registerDestructor } from '@ember/destroyable';
import { Scroller } from 'ember-primitives/components/scroller';
import { TrackedArray } from 'tracked-built-ins';
import templateOnly from '@ember/component/template-only';
import { assert } from '@ember/debug';
import { hash, fn } from '@ember/helper';
import { i as isActive, s as stripFormatting, h as highlightSearch } from './strip-formatting-C2yoK29y.js';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { CommandPalette } from 'ember-primitives/components/command-palette';
import { Modal } from 'ember-primitives/components/dialog';
import { Key, KeyCombo } from 'ember-primitives/components/keys';
import { getPromiseState } from 'reactiveweb/get-promise-state';

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
      // The co-located pages are a group, but they live in the root URL
      // space rather than under their name, so the link is the app's root
      // and `@homeName` names it.
      if (groupName === HOME_GROUP) {
        return {
          text: this.homeName,
          value: HOME_GROUP,
          href: this.rootURL
        };
      }
      return {
        text: groupName,
        value: groupName,
        // scoped mounts (addRoutes(context, groupName)) live at their own
        // URL, not at /GroupName
        href: this.#docs.groupHrefFor(groupName)
      };
    });
  }
  isActive = groupName => {
    // The group is derived from the URL by the docs service (rootURL-aware),
    // rather than comparing the group name against currentURL directly
    // (which always failed: 'Docs' never prefixes '/Docs/...').
    return this.#docs.selectedGroup === groupName;
  };
  get activeClass() {
    return this.args.activeClass ?? 'active';
  }
  static {
    setComponentTemplate(precompileTemplate("<nav aria-label=\"Groups\" ...attributes>\n  <ul>\n    {{#each this.groups as |group|}}\n      <li>\n        <a href={{group.href}} class={{if (this.isActive group.value) this.activeClass}}>\n\n          {{#if (has-block)}}\n            {{yield group.text}}\n          {{else}}\n            {{group.text}}\n          {{/if}}\n\n        </a>\n      </li>\n    {{/each}}\n  </ul>\n</nav>", {
      strictMode: true
    }), this);
  }
}

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

const blockWasRenamed = () => {
  assert('<PageNav /> has no `:collection` block. It is now called `:section`, and yields `section` rather than `collection`. See "Upgrading from 5.x" in the migration guide.', false);
};
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
    setComponentTemplate(precompileTemplate("{{!--log this.docs--}}\n{{#if (has-block \"collection\")}}{{blockWasRenamed}}{{/if}}\n<nav aria-label=\"Selected Group\" ...attributes>\n  <Pages @item={{this.docs.tree}}>\n\n    <:page as |p|>\n      {{#if (has-block \"page\")}}\n        {{yield p to=\"page\"}}\n      {{else}}\n        <p.Link>\n          {{p.page.name}}\n        </p.Link>\n      {{/if}}\n    </:page>\n\n    <:section as |c|>\n      {{#if (has-block \"section\")}}\n        {{yield c to=\"section\"}}\n      {{else}}\n        {{#if c.index}}\n          <c.index.Link>\n            {{c.index.page.name}}\n          </c.index.Link>\n        {{else}}\n          {{c.section.name}}\n        {{/if}}\n      {{/if}}\n    </:section>\n  </Pages>\n</nav>", {
      strictMode: true,
      scope: () => ({
        blockWasRenamed,
        Pages
      })
    }), this);
  }
}
const not = x => !x;
const Pages = setComponentTemplate(precompileTemplate("{{#if (isPageTree @item)}}\n  <ul>\n    {{#each @item.pages as |page|}}\n      {{#if (not (isIndex page))}}\n        <li>\n          {{#if (isPageTree page)}}\n\n            {{!-- index.md pages can make the whole section clickable --}}\n            {{#let (getIndexPage page) as |indexPage|}}\n              {{#if indexPage}}\n                {{yield (hash section=page index=(hash page=indexPage Link=(component PageLink item=indexPage activeClass=@activeClass))) to=\"section\"}}\n              {{else}}\n                {{yield (hash section=page) to=\"section\"}}\n              {{/if}}\n            {{/let}}\n          {{/if}}\n\n          <Pages @item={{page}}>\n            <:page as |p|>{{yield p to=\"page\"}}</:page>\n            <:section as |c|>{{yield c to=\"section\"}}</:section>\n          </Pages>\n        </li>\n      {{/if}}\n    {{/each}}\n  </ul>\n{{else}}\n  {{yield (hash page=@item Link=(component PageLink item=@item activeClass=@activeClass)) to=\"page\"}}\n{{/if}}", {
  strictMode: true,
  scope: () => ({
    isPageTree,
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
  get #docs() {
    return docsManager();
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
  static {
    setComponentTemplate(precompileTemplate("<a href={{this.href}} class={{if this.isActive this.activeClass}} ...attributes>{{yield @item this.isActive}}</a>", {
      strictMode: true
    }), this);
  }
}

const HOTKEY = 'mod+k';
/* the same combination, spelled for each platform's own key */
const KEYS = ['Ctrl', 'K'];
const MAC_KEYS = ['⌘', 'K'];
/* one or two characters match most of a docs site, which is the same as
   matching none of it */
const MIN_LENGTH = 3;
/* ranking puts the answer near the top; rendering every page renders noise */
const LIMIT = 20;
const PLACEHOLDER = 'Search titles, headings, and prose…';
const MagnifyingGlass = setComponentTemplate(precompileTemplate("<svg class=\"kolay__search__icon\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" ...attributes><circle cx=\"11\" cy=\"11\" r=\"6.5\" /><path d=\"m16 16 5 5\" /></svg>", {
  strictMode: true
}), templateOnly());
const Cross = setComponentTemplate(precompileTemplate("<svg class=\"kolay__search__icon\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" ...attributes><path d=\"m6 6 12 12M18 6 6 18\" /></svg>", {
  strictMode: true
}), templateOnly());
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
class Search extends Component {
  static {
    g(this.prototype, "query", [tracked], function () {
      return '';
    });
  }
  #query = (i(this, "query"), void 0);
  get trimmed() {
    return this.query.trim();
  }
  /**
  * `@cached` so the search runs once per query rather than once per access:
  * `getPromiseState` keys its state off the promise it is handed, and a new
  * promise each time would mean a new pending state each time.
  */
  get search() {
    if (this.trimmed.length < MIN_LENGTH) return Promise.resolve([]);
    return searcher().search(this.query);
  }
  static {
    n(this.prototype, "search", [cached]);
  }
  get state() {
    return getPromiseState(this.search);
  }
  get total() {
    return this.state.resolved?.length ?? 0;
  }
  get results() {
    return this.state.resolved?.slice(0, LIMIT) ?? [];
  }
  /**
  * What the listbox is doing, in words -- the part of a combobox a screen
  * reader is not told by the options themselves.
  */
  get status() {
    if (!this.trimmed) return 'Search every guide, reference page, heading, and paragraph.';
    if (this.trimmed.length < MIN_LENGTH) {
      return `Type at least ${MIN_LENGTH} characters.`;
    }
    if (this.state.isLoading) return 'Searching…';
    if (this.total === 0) return `No results for “${this.trimmed}”.`;
    if (this.total > LIMIT) return `Showing ${LIMIT} of ${this.total} results.`;
    return this.total === 1 ? '1 result.' : `${this.total} results.`;
  }
  setQuery = query => {
    this.query = query;
  };
  excerpt = result => stripFormatting(result.text, result.excerptRange);
  /** Clearing is for carrying on typing, so the caret goes back to the input. */
  clear = (setQuery, event) => {
    setQuery('');
    const button = event.currentTarget;
    button.parentElement?.querySelector('input')?.focus();
  };
  static {
    setComponentTemplate(precompileTemplate("<Modal as |m|>\n  {{#if (has-block \"trigger\")}}\n    {{yield m.open m.focusOnClose to=\"trigger\"}}\n  {{else}}\n    <button type=\"button\" class=\"kolay__search__trigger\" {{m.focusOnClose}} {{on \"click\" m.open}}>\n      <MagnifyingGlass />\n      <span>Search docs</span>\n      <span class=\"kolay__search__trigger__hint\">\n        <KeyCombo @keys={{KEYS}} @mac={{MAC_KEYS}} />\n      </span>\n    </button>\n  {{/if}}\n\n  <m.Dialog class=\"kolay__search\" closedby=\"any\">\n    <CommandPalette @hotkey={{HOTKEY}} @onOpen={{m.open}} @onSelect={{m.close}} @onQueryChange={{this.setQuery}} as |c|>\n      <div class=\"kolay__search__field\">\n        <MagnifyingGlass />\n        <c.Input class=\"kolay__search__input\" aria-label=\"Search docs\" placeholder={{PLACEHOLDER}} />\n        {{#if c.query}}\n          <button type=\"button\" class=\"kolay__search__clear\" aria-label=\"Clear search\" {{on \"click\" (fn this.clear c.setQuery)}}><Cross /></button>\n        {{/if}}\n      </div>\n\n      <c.List class=\"kolay__search__results\" data-has-results=\"{{if this.results.length \"true\" \"false\"}}\" as |l|>\n        {{#each this.results key=\"path\" as |result|}}\n          <l.LinkItem class=\"kolay__search__result\" @href={{result.path}}>\n            {{#if (has-block \"result\")}}\n              {{yield result this.query to=\"result\"}}\n            {{else}}\n              <p class=\"kolay__search__result__group\">{{result.groupName}}</p>\n              <h2 class=\"kolay__search__result__title\">{{result.title}}</h2>\n              <p class=\"kolay__search__result__excerpt\" {{highlightSearch this.query}}>{{this.excerpt result}}</p>\n            {{/if}}\n          </l.LinkItem>\n        {{/each}}\n      </c.List>\n\n      <div class=\"kolay__search__footer\">\n        <p class=\"kolay__search__status\" role=\"status\">{{this.status}}</p>\n        <button type=\"button\" class=\"kolay__search__close\" {{on \"click\" m.close}}>\n          Close\n          <Key>Esc</Key>\n        </button>\n      </div>\n    </CommandPalette>\n  </m.Dialog>\n</Modal>", {
      strictMode: true,
      scope: () => ({
        Modal,
        on,
        MagnifyingGlass,
        KeyCombo,
        KEYS,
        MAC_KEYS,
        CommandPalette,
        HOTKEY,
        PLACEHOLDER,
        fn,
        Cross,
        highlightSearch,
        Key
      })
    }), this);
  }
}

export { GroupNav, Logs, Page, PageNav, Search };
//# sourceMappingURL=components.js.map
