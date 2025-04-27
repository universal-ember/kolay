import type { DeclarationReflection, ReferenceType  } from 'typedoc';

interface HasType {
  type: string;
}

export function isDeclarationReference(x?: unknown): x is DeclarationReflection {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('variant' in x)) return false;
  if (typeof (x).variant !== 'string') return false;

  return x.variant === 'declaration' ;
}

export function isReference(x?: HasType): x is  ReferenceType {
  if (!x) return false;

  return x.type === 'reference';
}
