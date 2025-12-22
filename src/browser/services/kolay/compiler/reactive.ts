import { resource, resourceFactory } from 'ember-resources';

import type Compiler from '../compiler.ts';

export function Compiled(textFn: string | null | (() => string | null)) {
  return resource(({ owner }) => {
    const compiler = owner.lookup('service:kolay/compiler') as Compiler;

    const text = typeof textFn === 'function' ? textFn() : textFn;

    return compiler.compileMD(text);
  });
}

// template-only support
resourceFactory(Compiled);
