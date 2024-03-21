# `<HelperSignature />`

Render the docs generated from Comments, [JSDoc](https://jsdoc.app/), etc, specialized specifically for helpers and plain functions, which have a known signature format, consisting of `Args`, and `Return`.

This, along with the other API doc-related components, are powered by [TypeDoc](https://typedoc.org/) and generated from declarations.

## API Reference

```hbs live no-shadow
<ComponentSignature
  @module='src/browser/re-exports'
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
  @module='src/browser/private/samples'
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
  @module='src/browser/private/samples'
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
  @module='src/browser/private/samples'
  @name='plainHelperC'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>class-based classic Helper, inline Signature (not currently supported)</summary>

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
  @module='src/browser/private/samples'
  @name='classHelperD'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>class-based classic Helper, referenced Signature (not currently supported)</summary>

```ts
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
```

```hbs live no-shadow
<HelperSignature
  @module='src/browser/private/samples'
  @name='classHelperE'
  @package='kolay'
/>
```

</fieldset>
