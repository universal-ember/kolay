import { modifier } from 'ember-modifier';

import type { ModifierLike } from '@glint/template';

/**
 * Every result's ranges live in this one highlight: `::highlight(name)` picks
 * a registered name, so a highlight per element would need a CSS rule per
 * element. It is a live Set — adding to it after registering is enough.
 */
const found = new Highlight();

CSS.highlights.set('search-query', found);

export const highlightSearch: ModifierLike<{
  Element: HTMLElement;
  Args: {
    Positional: [query: string];
  };
}> = modifier((element: HTMLElement, [query]: [string]) => {
  if (!('highlights' in CSS) || !query) return;

  const mine: Range[] = [];
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
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
