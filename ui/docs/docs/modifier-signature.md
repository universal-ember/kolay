# `<ModifierSignature />`

Render the docs generated from Comments, [JSDoc](https://jsdoc.app/), etc, specialized specifically for element modifiers, which have a known signature format, consisting of `Args`, and `Element`.

This, along with the other API doc-related components, are powered by [TypeDoc](https://typedoc.org/) and generated from declarations.

## API Reference

```hbs live no-shadow
<ComponentSignature
  @module='src/browser/re-exports'
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
  @module='src/browser/private/samples'
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
  @module='src/browser/private/samples'
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
  @module='src/browser/private/samples'
  @name='functionModifierA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>function modifier, implicit signature (not currentnly supported)</summary>

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
  @module='src/browser/private/samples'
  @name='functionModifierB'
  @package='kolay'
/>
```

</fieldset>
