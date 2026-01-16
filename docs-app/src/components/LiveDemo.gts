import Component from '@glimmer/component';
import { Compiled } from 'kolay';

export interface LiveDemoSignature {
  Args: {
    code: string;
    format?: 'hbs' | 'gjs' | 'glimdown';
  };
}

/**
 * Component to render live code blocks using ember-repl compiler
 * with kolay components available in scope
 */
export default class LiveDemo extends Component<LiveDemoSignature> {
  <template>
    <Compiled @source={{@code}} @format={{@format}} />
  </template>
}
