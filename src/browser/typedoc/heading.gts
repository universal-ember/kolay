import Component from '@glimmer/component';

import { element } from 'ember-element-helper';

import type { TOC } from '@ember/component/template-only';
import type Owner from '@ember/owner';

/**
 * Finds the heading level (1-6) of the nearest heading that precedes
 * `from` in document order, crossing out of shadow roots as needed.
 */
export function previousHeadingLevel(from: Node): number | undefined {
  let node: Node | null = from;

  while (node) {
    const previous: Node | null = node.previousSibling;

    if (previous) {
      // The most deeply nested last node of the previous sibling
      // is the closest preceding node in document order.
      let deepest: Node = previous;

      while (deepest.lastChild) deepest = deepest.lastChild;
      node = deepest;
    } else {
      const parent: ParentNode | null = node.parentNode;

      node = parent instanceof ShadowRoot ? parent.host : parent;
    }

    if (node instanceof Element) {
      const match = /^H([1-6])$/.exec(node.tagName);

      if (match?.[1]) return Number(match[1]);
    }
  }

  return undefined;
}

/**
 * Computes the heading level to use within a block of rendered api-docs:
 * one level below whatever heading precedes the block in the document.
 *
 * e.g.: when api docs are rendered after an "API Reference" <h2>,
 *       every heading within them is an <h3>.
 *
 * The level is computed once and shared by every heading within the block --
 * Element / Arguments / Blocks / Return are sibling headings, so headings
 * that render earlier must not push later ones deeper.
 *
 * (This is also why per-heading automatic level detection
 *  (ember-primitives' <Heading>) is not used here: it treats every <section>
 *  as a nesting boundary, which either isolates these headings to <h1>,
 *  or cascades each sibling one level deeper than the previous --
 *  both of which fail axe's heading-order audit on consuming docs pages.)
 */
export class HeadingScope extends Component<{
  Blocks: { default: [level: number] };
}> {
  anchor: Text;

  constructor(owner: Owner, args: object) {
    super(owner, args);
    this.anchor = document.createTextNode('');
  }

  /**
   * Because the anchor precedes every heading we yield to,
   * this is stable no matter how often it is re-evaluated.
   */
  get level(): number {
    return Math.min((previousHeadingLevel(this.anchor) ?? 1) + 1, 6);
  }

  <template>{{this.anchor}}{{yield this.level}}</template>
}

const tagFor = (level: number) => `h${level}`;

/**
 * An h1-h6 heading at the given @level.
 */
export const SectionHeading: TOC<{
  Element: HTMLHeadingElement;
  Args: { level: number };
  Blocks: { default: [] };
}> = <template>
  {{#let (element (tagFor @level)) as |H|}}
    <H ...attributes>{{yield}}</H>
  {{/let}}
</template>;
