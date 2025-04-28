import type { ReferenceType } from 'typedoc';

interface HasType {
  type: string;
}

export function isReference(x?: HasType): x is ReferenceType {
  if (!x) return false;

  return x.type === 'reference';
}
