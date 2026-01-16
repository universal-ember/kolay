import Component from '@glimmer/component';
import { compile, getCompiler } from 'ember-repl';
import { resource } from 'ember-resources';

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
  compiled = resource(({ owner }) => {
    const { code, format = 'hbs' } = this.args;
    
    const state = compile(getCompiler(owner), code, {
      format: format as 'hbs' | 'gjs' | 'glimdown',
    });

    return state;
  });

  <template>
    {{#if this.compiled.component}}
      <this.compiled.component />
    {{/if}}
  </template>
}
