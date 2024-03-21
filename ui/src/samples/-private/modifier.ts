import { modifier } from 'ember-modifier';

import type { ModifierLike } from '@glint/template';

export interface ModifierSignatureA {
  Element: HTMLDivElement;
  Args: {
    Positional: [x: number, y: number];
    Named: { invert?: boolean };
  };
}

export const functionModifierA = modifier<{
  Element: HTMLDivElement;
  Args: {
    Positional: [x: number, y: number];
    Named: { invert?: boolean };
  };
}>(
  (
    element: HTMLDivElement,
    positional: [x: number, y: number],
    named: { invert?: boolean },
  ) => {
    // eslint-disable-next-line no-console
    console.log(element, positional, named);
  },
);

export const functionModifierB = modifier(
  (
    element: HTMLDivElement,
    positional: [x: number, y: number],
    named: { invert?: boolean },
  ) => {
    // eslint-disable-next-line no-console
    console.log(element, positional, named);
  },
);

export const functionModifierC: ModifierLike<{
  Element: HTMLDivElement;
  Args: {
    Positional: [x: number, y: number];
    Named: { invert?: boolean };
  };
}> = modifier(
  (
    element: HTMLDivElement,
    positional: [x: number, y: number],
    named: { invert?: boolean },
  ) => {
    // eslint-disable-next-line no-console
    console.log(element, positional, named);
  },
);
