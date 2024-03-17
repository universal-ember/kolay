# `<HelperSignature />`

Render the docs generated from Comments, [JSDoc](https://jsdoc.app/), etc, specialized specifically for helpers and plain functions, which have a known signature format, consisting of `Args`, and `Return`.

This, along with the other API doc-related components, are powered by [TypeDoc](https://typedoc.org/) and generated from declarations.

## API Reference

API Reference generated via:

```ts
export function plainHelperA(a: number, b: number): number {
  return a + b;
}
```

```hbs live no-shadow preview below
<HelperSignature
  @module='src/browser/private/samples'
  @name='plainHelperA'
  @package='kolay'
/>
```

---

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

---

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

---

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

```hbs live no-shadow preview below
<HelperSignature
  @module='src/browser/private/samples'
  @name='classHelperD'
  @package='kolay'
/>
```

---

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

```hbs live no-shadow preview below
<HelperSignature
  @module='src/browser/private/samples'
  @name='classHelperE'
  @package='kolay'
/>
```
