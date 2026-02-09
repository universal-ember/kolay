import { compile, getCompiler } from 'ember-repl';
import { resource, resourceFactory } from 'ember-resources';

import type Owner from '@ember/owner';

export function compileText(owner: Owner, text: string | null) {
  const state = compile(getCompiler(owner), text, {
    /**
     * Documentation can only be in markdown.
     */
    format: 'glimdown',
  });

  return state;
}

export function Compiled(textFn: string | null | (() => string | null)) {
  return resource(({ owner }) => {
    const text = typeof textFn === 'function' ? textFn() : textFn;

    return compileText(owner, text);
  });
}

// template-only support
resourceFactory(Compiled);
