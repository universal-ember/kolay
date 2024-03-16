/* eslint-disable no-console */
import Helper from '@ember/component/helper';

import type { HelperLike } from '@glint/template';

export function plainHelperA(a: number, b: number): number {
  return a + b;
}

export const helperLikeB = ((...args: unknown[]) => {
  console.log(args);
}) as unknown as HelperLike<{
  Args: {
    Named: { optional?: boolean };
    Positional: [first: string, second?: string];
  };
  Return: string;
}>;

export const plainHelperC = (a: number, b: number, options?: { optional?: boolean, required: boolean  }) => {
  /* ... */
  console.log(a, b, options);
}

export class classHelperD extends Helper<{
  Args: {
    Named: { optional?: boolean };
    Positional: [first: string, second?: string];
  };
  Return: string;
}> {
  /* ... */
}

interface ESignature {
  Args: {
    Named: { optional?: boolean };
    Positional: [first: string, second?: string];
  };
  Return: string;
}

export class classHelperE extends Helper<ESignature> {
  /* ... */
}
