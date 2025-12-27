import { compile, getCompiler } from 'ember-repl';
import { resource, resourceFactory } from 'ember-resources';

export function Compiled(textFn: string | null | (() => string | null)) {
  return resource(({ owner }) => {
    const text = typeof textFn === 'function' ? textFn() : textFn;

    const state = compile(getCompiler(owner), text, {
      /**
       * Documentation can only be in markdown.
       */
      format: 'glimdown',
    });

    return state;
  });
}

// template-only support
resourceFactory(Compiled);
