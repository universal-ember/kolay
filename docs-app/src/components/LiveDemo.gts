import Component from '@glimmer/component';
import { Compiled } from 'kolay';

export interface LiveDemoSignature {
  Args: {
    code: string;
  };
}

/**
 * Component to render live code blocks using kolay's Compiled helper
 */
export default class LiveDemo extends Component<LiveDemoSignature> {
  <template>
    {{#let (Compiled @code) as |compiled|}}
      {{#if compiled.component}}
        <compiled.component />
      {{/if}}
    {{/let}}
  </template>
}
