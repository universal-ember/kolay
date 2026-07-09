import { buildWaiter } from '@ember/test-waiters';
import { compile, getCompiler } from 'ember-repl';
import { resource, resourceFactory } from 'ember-resources';

// import { lru } from '../../utils.ts';
import type Owner from '@ember/owner';

// Lets `settled()` (and so `visit`/`click` in tests) wait for in-flight
// markdown compiles. Without this, tests race the async compile and see
// partially-rendered pages. A no-op in production builds.
const compileWaiter = buildWaiter('kolay:compile-text');

export function compileText(owner: Owner, text: string | null) {
  // return lru(text, () =>
  const state = compile(getCompiler(owner), text, {
    /**
     * Documentation can only be in markdown.
     */
    format: 'glimdown',
  });
  // );

  // With no text, the state is a MissingTextState whose promise never
  // settles — don't hold a waiter open for it.
  if (text) {
    const token = compileWaiter.beginAsync();
    const done = () => compileWaiter.endAsync(token);

    state.promise.then(done, done);
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
