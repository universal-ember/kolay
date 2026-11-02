import { waitForPromise } from '@ember/test-waiters';

import { compile, getCompiler } from 'ember-repl';
import { resource, resourceFactory } from 'ember-resources';

// import { lru } from '../../utils.ts';
import type Owner from '@ember/owner';

export function compileText(owner: Owner, text: string | null) {
  // return lru(text, () =>
  const state = compile(getCompiler(owner), text, {
    /**
     * Documentation can only be in markdown.
     */
    format: 'glimdown',
  });
  // );

  // Lets `settled()` (and so `visit`/`click` in tests) wait for the compile,
  // so tests never see a partially-rendered page. A no-op in production.
  // With no text, the state is a MissingTextState whose promise never
  // settles — don't hold a waiter open for it. The catch is only for our
  // chained copy: a compile error still surfaces via the state itself.
  if (text) {
    waitForPromise(state.promise).catch(() => null);
  }

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
