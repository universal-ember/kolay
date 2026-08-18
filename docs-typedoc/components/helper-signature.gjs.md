# `<HelperSignature />`

This component shows the docs that come from your comments and your [JSDoc](https://jsdoc.app/). It is for a helper or a plain function, which has a known signature format of `Args` and `Return`.

This component, and the other api docs components, use [TypeDoc](https://typedoc.org/). TypeDoc reads your type declarations.

## API Reference

```hbs live no-shadow
<ComponentSignature
  @module='declarations/browser'
  @name='HelperSignature'
  @package='kolay'
/>
```

## Supported Signatures

<fieldset>
  <summary>Plain Function, JSDoc</summary>

```ts
/**
 * @param {number} first - the first argument
 * @param {number} second - the second argument
 * @return {number} the sum of the two values
 */
export function plainHelperA(first: number, second: number): number {
  return first + second;
}
```

```hbs live no-shadow preview below
<HelperSignature
  @module='declarations/browser/samples/-private'
  @name='plainHelperA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>Plain Function, cast as HelperLike</summary>

```ts
import type { HelperLike } from '@glint/template';

export const helperLikeB = ((...args: unknown[]) => {
  /* ... */
}) as unknown as HelperLike<{
  Args: {
    Named: { optional?: boolean };
    Positional: [first: string, second?: string];
  };
  Return: string;
}>;
```

```hbs live no-shadow preview below
<HelperSignature
  @module='declarations/browser/samples/-private'
  @name='helperLikeB'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>Plain Function, typescript</summary>

```ts
export const plainHelperC = (
  a: number,
  b: number,
  options?: { optional?: boolean; required: boolean },
) => {
  /* ... */
  console.log(a, b, options);
};
```

```hbs live no-shadow preview below
<HelperSignature
  @module='declarations/browser/samples/-private'
  @name='plainHelperC'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>class-based classic Helper, inline Signature</summary>

```ts
export class ClassHelperD extends Helper<{
  Args: {
    Named: { optional?: boolean };
    Positional: [first: string, second?: string];
  };
  Return: string;
}> {
  /* ... */
}
```

```hbs live no-shadow
<HelperSignature
  @module='declarations/browser/samples/-private'
  @name='classHelperD'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>class-based classic Helper, referenced Signature</summary>

```ts
// NOTE: the interface must be exported
export interface ESignature {
  Args: {
    Named: { optional?: boolean };
    Positional: [first: string, second?: string];
  };
  Return: string;
}

export class classHelperE extends Helper<ESignature> {
  /* ... */
}
```

```hbs live no-shadow
<HelperSignature
  @module='declarations/browser/samples/-private'
  @name='classHelperE'
  @package='kolay'
/>
```

</fieldset>
