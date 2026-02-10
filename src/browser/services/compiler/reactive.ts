import { compile, getCompiler } from 'ember-repl';
import { resource, resourceFactory } from 'ember-resources';

import { lru } from '../../utils.ts';

import type Owner from '@ember/owner';

export function compileText(owner: Owner, text: string | null) {
  return lru(text, () =>
    compile(getCompiler(owner), text, {
      /**
       * Documentation can only be in markdown.
       */
      format: 'glimdown',
    })
  );
}

export function Compiled(textFn: string | null | (() => string | null)) {
  return resource(({ owner }) => {
    const text = typeof textFn === 'function' ? textFn() : textFn;

    return compileText(owner, text);
  });
}

// template-only support
resourceFactory(Compiled);
