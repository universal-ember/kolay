import { a as isPageTree, j as samePagePath } from './docs-CGM7i59Z.js';
import { modifier } from 'ember-modifier';

/**
 * Whether a manifest item is the currently visited page.
 *
 * For a `Page`, the item's `appRelativePath` (computed at build time) is
 * compared against the app-relative `router.currentURL`, ignoring query
 * params / hash, and treating paths with and without the `.md` extension as
 * the same page (both are visitable).
 *
 * For a `PageTree`, this is true when any page within it (recursively) is
 * active — useful for highlighting or expanding the branch of a nav tree that
 * contains the current page.
 *
 * ```gjs
 * import { isActive } from 'kolay';
 *
 * // in a component with the router service injected
 * isActive(item, this.router.currentURL);
 * ```
 */
function isActive(item, currentURL) {
  if (isPageTree(item)) {
    return item.pages.some(child => isActive(child, currentURL));
  }
  const subPath = item.appRelativePath;
  if (subPath === '/') return false;
  const [current = ''] = currentURL?.split(/[?#]/) ?? [];
  return samePagePath(current, subPath);
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
  // Inline HTML, keeping the text it wrapped. Lowercase names only: every
  // HTML element has one, and a component written in prose does not, so
  // `<Search />` survives and `<kbd>` does not.
  .replaceAll(/<\/?[a-z][a-z0-9-]*(?:\s[^>]*?)?\/?>/g, '').replaceAll(/\s+/g, ' ').trim();
}

export { highlightSearch as h, isActive as i, stripFormatting as s };
//# sourceMappingURL=strip-formatting-C2yoK29y.js.map
