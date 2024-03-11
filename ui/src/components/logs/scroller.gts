import Component from '@glimmer/component';
import { fn } from '@ember/helper';

import { modifier } from 'ember-modifier';

export class Scroller extends Component<{
  Element: HTMLDivElement;
  Blocks: { default: [scrollToBottom: () => void] };
}> {
  declare withinElement: HTMLDivElement;

  ref = modifier((el: HTMLDivElement) => {
    this.withinElement = el;
  });

  <template>
    <div ...attributes {{this.ref}}>
      {{yield (fn scrollToBottom this.withinElement)}}
    </div>
  </template>
}

let frame: number;

function scrollToBottom(element: HTMLElement) {
  if (frame) {
    cancelAnimationFrame(frame);
  }

  frame = requestAnimationFrame(() => {
    element.scrollTo({
      top: element.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  });
}
