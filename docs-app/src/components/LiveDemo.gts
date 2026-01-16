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
  get compiled() {
    return Compiled(this.args.code);
  }

  <template>
    {{#if this.compiled.component}}
      <this.compiled.component />
    {{/if}}
  </template>
}
