import { resource, resourceFactory } from 'ember-resources';

import type Compiler from '../compiler.ts';
import type { CompileState } from './compile-state.ts';

export function Compiled(
  textFn: string | null | (() => string | null),
): CompileState {
  return resource(({ owner }) => {
    let compiler = owner.lookup('service:kolay/compiler') as Compiler;

    let text = typeof textFn === 'function' ? textFn() : textFn;

    return compiler.compileMD(text);
  });
}

// template-only support
resourceFactory(Compiled);
