# `<ModifierSignature />`

This component shows the docs that come from your comments and your [JSDoc](https://jsdoc.app/). It is for an element modifier, which has a known signature format of `Args` and `Element`.

This component, and the other api docs components, use [TypeDoc](https://typedoc.org/). TypeDoc reads your type declarations.

## API Reference

```hbs live no-shadow
<ComponentSignature
  @module='declarations/browser'
  @name='ModifierSignature'
  @package='kolay'
/>
```

## Supported Signatures

<fieldset>
  <summary>Direct Interface</summary>

```ts
export interface ModifierSignatureA {
  Element: HTMLDivElement;
  Args: {
    Positional: [x: number, y: number];
    Named: { invert?: boolean };
  };
}
```

```hbs live no-shadow preview below
<ModifierSignature
  @module='declarations/browser/samples/-private'
  @name='ModifierSignatureA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>function modifier, ModifierLike</summary>

```ts
import { ModifierLike } from '@glint/template';

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
    /* ... */
  },
);
```

```hbs live no-shadow preview below
<ModifierSignature
  @module='declarations/browser/samples/-private'
  @name='functionModifierC'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>function modifier, inline signature (not currently supported)</summary>

```ts
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
    /* ... */
  },
);
```

```hbs live no-shadow preview below
<ModifierSignature
  @module='declarations/browser/samples/-private'
  @name='functionModifierA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>function modifier, implicit signature (not currently supported)</summary>

```ts
export const functionModifierB = modifier(
  (
    element: HTMLDivElement,
    positional: [x: number, y: number],
    named: { invert?: boolean },
  ) => {
    /* ... */
  },
);
```

```hbs live no-shadow preview below
<ModifierSignature
  @module='declarations/browser/samples/-private'
  @name='functionModifierB'
  @package='kolay'
/>
```

</fieldset>
