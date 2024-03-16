import { modifier } from 'ember-modifier';

export const functionExampleA = modifier(
  (
    element: HTMLDivElement,
    positional: [x: number, y: number],
    named: { invert?: boolean },
  ) => {
    // eslint-disable-next-line no-console
    console.log(element, positional, named);
  },
);
