import Component from '@glimmer/component';
import { compile, getCompiler } from 'ember-repl';
import { resource } from 'ember-resources';
import {
  APIDocs,
  CommentQuery,
  ComponentSignature,
  HelperSignature,
  ModifierSignature,
} from 'kolay';

export interface LiveDemoSignature {
  Args: {
    code: string;
  };
}

/**
 * Component to render live code blocks using ember-repl compiler
 * with kolay components available in scope
 */
export default class LiveDemo extends Component<LiveDemoSignature> {
  // Make a resource that compiles the code with kolay components in scope
  compiled = resource(({ owner }) => {
    const { code } = this.args;
    
    // Compile the template with ember-repl
    // This will make the kolay components available in the template scope
    const compiled = compile(getCompiler(owner), code, {
      format: 'hbs',
      globals: {
        APIDocs,
        CommentQuery,
        ComponentSignature,
        HelperSignature,
        ModifierSignature,
      },
    });

    return compiled;
  });

  <template>
    {{#if this.compiled.component}}
      <this.compiled.component />
    {{/if}}
  </template>
}
