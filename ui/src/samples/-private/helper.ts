import type { HelperLike } from '@glint/template';

export function plainHelperA(a: number, b: number): number {
  return a + b;
}

export const helperLikeB = undefined as unknown as HelperLike<{
  Args: {
    Named: { optional?: boolean };
    Positional: [first: string, second?: string];
  };
  Return: string;
}>;
