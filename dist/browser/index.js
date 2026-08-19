import './kolay.css';
export { A as APIDocs, C as CommentQuery, a as Compiled, b as ComponentSignature, H as HelperSignature, M as ModifierSignature, t as typedocLoader } from './modifier-BQmws-Aa.js';
export { l as loadCompiledDocs } from './load-compiled-docs-rjVGMYB8.js';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';
import { r as registerScopedRoute, b as scopedRouteNameFor, d as docsManager, c as groupNameForRoute } from './docs-CMPK6ht1.js';
export { C as CompiledDoc, e as compiledDoc, g as getIndexPage, i as isIndex, a as isPageTree, f as resolveRedirect, h as searcher, s as selected } from './docs-CMPK6ht1.js';
export { i as isActive } from './is-active-Dc9ZRQXt.js';
import { modifier } from 'ember-modifier';

/**
 * Adds the wildcard docs route.
 *
 * The primary way to mount a group is through its virtual module —
 * `docs('foo')` enables `virtual:kolay/docs/foo`, whose `addRoutes` is
 * this function, pre-scoped to the group:
 *
 * ```js
 * import { addRoutes as addFooRoutes } from 'virtual:kolay/docs/foo';
 *
 * Router.map(function () {
 *   this.route('help', function () {
 *     addFooRoutes(this);
 *   });
 * });
 * ```
 *
 * Directly, it may be called at the top level of the router map (all
 * groups are served from the root URL space), or inside nested routes to
 * mount groups as their own routes — once per mount:
 *
 * ```js
 * Router.map(function () {
 *   this.route('guides', function () {
 *     addRoutes(this);
 *   });
 * });
 * ```
 *
 * Without a group name, a mount serves whichever group the URL names — so
 * a nested mount's path must match its group's name.
 *
 * With a group name, the mount is scoped: it serves that group's docs
 * regardless of the mount's own path —
 * `addRoutes(this, 'foo-bar')` brings all of the docs from the `foo-bar`
 * group into the route addRoutes was called from:
 *
 * ```js
 * Router.map(function () {
 *   this.route('help', function () {
 *     addRoutes(this, 'foo-bar'); // /help/... serves the foo-bar group
 *   });
 * });
 * ```
 *
 * (One mount per route: addRoutes always creates a route named `page`,
 *  so two mounts need two different surrounding routes.)
 */
function addRoutes(context, groupName) {
  /**
   * We need a level of nesting for every `/` in the URL so that we don't over-refresh / render the whole page
   */
  context.route('page', {
    path: '/*page'
  }, function () {});
  if (groupName) {
    registerScopedRoute(scopedRouteNameFor(context.parent), groupName);
  }
}

/**
 * Does our target destination exist? if not,
 * redirect to the first page on the namespace
 *
 * For use with addRoutes(), which defines a "page" path matcher
 */
function handlePotentialIndexVisit(context, transition) {
  const docs = docsManager();
  if (transition.to?.localName !== 'index') return;
  const parent = transition.to.parent;

  /**
   * With a top-level addRoutes() mount, visiting `/GroupName` lands on
   * `page.index` with the group name as the wildcard segment.
   *
   * With a nested mount (`this.route('guides', function () { addRoutes(this) })`),
   * visiting `/guides` lands on the mount route's own index, so the mount
   * route's name is the group name — unless the mount is scoped
   * (`addRoutes(this, groupName)`), in which case the binding decides.
   *
   * Visiting the app's root (`/`) lands on the top-level `index` route —
   * there is no group in the URL, so a scoped top-level mount's group, or
   * the default (first) group, is used.
   */
  const rawWildcardParam = parent?.params?.page;
  const wildcardParam = typeof rawWildcardParam === 'string' ? rawWildcardParam.replace(/\/+$/, '') : rawWildcardParam;
  const candidates = transition.to.name === 'index' ? [groupNameForRoute('page'), docs.availableGroups[0]] : [
  // the mount's own index: the wildcard is a sibling route
  parent && groupNameForRoute(`${parent.name}.page`),
  // an empty wildcard visit: the wildcard is the parent itself.
  // Only when no page was actually requested — every page visit
  // also lands on the wildcard's index (with the page as the
  // param), and those must not be redirected.
  parent && !wildcardParam && groupNameForRoute(parent.name), wildcardParam, parent?.localName];
  const groupName = candidates.map(candidate => typeof candidate === 'string' ? docs.canonicalGroupName(candidate) : undefined).find(match => match !== undefined);
  if (!groupName) return;
  const group = docs.groupFor(groupName);
  const first = group.list[0];
  if (!first) {
    console.warn(`Could not determine first page in group: ${groupName}`);
    return;
  }
  const router = getOwner(context)?.lookup('service:router');
  assert(`Expected to find the router service, but did not`, router);

  // `transitionTo` prepends the rootURL itself, so use the app-relative
  // path (`first.path` includes the rootURL and would double the prefix).
  // For scoped mounts, the mount-space URL differs from the manifest path —
  // the docs service knows both.
  router.transitionTo(docs.appRelativeHrefFor(first));
}

/**
 * Every result's ranges live in this one highlight: `::highlight(name)` picks
 * a registered name, so a highlight per element would need a CSS rule per
 * element. It is a live Set — adding to it after registering is enough.
 */
const found = new Highlight();
CSS.highlights.set('search-query', found);
const highlightSearch = modifier((element, [query]) => {
  if (!('highlights' in CSS) || !query) return;
  const mine = [];
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.data.toLocaleLowerCase();
    for (const term of terms) {
      let start = text.indexOf(term);
      while (start >= 0) {
        const range = new Range();
        range.setStart(node, start);
        range.setEnd(node, start + term.length);
        found.add(range);
        mine.push(range);
        start = text.indexOf(term, start + term.length);
      }
    }
  }
  return () => {
    for (const range of mine) {
      found.delete(range);
    }
  };
});

/**
 * NOTE: this is bonkers, but *way* faster than parsing markdown and printing HTML
 *
 * The excerpt's own source, stripped of the syntax that would read as noise.
 *
 * An excerpt is two lines of prose, which is worth no more than a pass of
 * replacements: compiling each one as markdown cost a few milliseconds per
 * result, serialized, and rendered nothing a reader could tell apart.
 */
function stripFormatting(text, range) {
  return (text ?? '').slice(range.start, range.end).replaceAll(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '') // list markers
  .replaceAll(/^\s*>\s?/gm, '') // blockquote markers
  .replaceAll(/^\s*\[\^[^\]]+\]:\s*/gm, '') // the label a footnote is defined under
  .replaceAll(/\[\^[^\]]+\]/g, '') // and the references to it
  .replaceAll(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images: their text
  .replaceAll(/!?\[([^\]]*)\]\[[^\]]*\]/g, '$1') // and the same for reference links
  .replaceAll(/\s*\|\s*/g, ' ') // table cell walls
  .replaceAll(/:?-{3,}:?/g, ' ') // and the rule under its header row
  .replaceAll(/[`*_~]/g, '') // emphasis and code marks
  .replaceAll(/\s+/g, ' ').trim();
}

export { addRoutes, docsManager, handlePotentialIndexVisit, highlightSearch, stripFormatting };
//# sourceMappingURL=index.js.map
