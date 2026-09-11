import type { LiteralType, ReferenceType, SomeType } from 'typedoc';

interface HasType {
  type: string;
}

export function isReference(x?: HasType): x is ReferenceType {
  if (!x) return false;

  return x.type === 'reference';
}

export function isLiteral(x: SomeType | undefined): x is LiteralType {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;

  return x.type === 'literal';
}
