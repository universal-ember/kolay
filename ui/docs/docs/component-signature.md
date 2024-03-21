# `<ComponentSignature />`

Render the docs generated from Comments, [JSDoc](https://jsdoc.app/), etc, specialized specifically for components, which have a known signature format, consisting of `Args`, `Element` and `Blocks`.

This, along with the other API doc-related components, are powered by [TypeDoc](https://typedoc.org/) and generated from declarations.

## API Reference

```hbs live no-shadow
<ComponentSignature
  @module='src/browser/re-exports'
  @name='ComponentSignature'
  @package='kolay'
/>
```

## Supported Signatures

<fieldset>
  <summary>Separate Interface</summary>

```gts
export interface SignatureA {
  Element: HTMLDivElement;
  Args: {
    foo: number;
    bar: string;
  };
  Blocks: {
    default: [first: number, second: string];
    namedBlockA: [first: typeof ClassA];
    namedBlockB: [boolean];
  };
}
```

```hbs live no-shadow preview below
<ComponentSignature
  @module='src/browser/private/samples'
  @name='SignatureA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>Inline</summary>

```gts
export class ClassA extends Component<{
  Element: HTMLDivElement;
  Args: {
    foo: number;
    bar: string;
  };
  Blocks: {
    default: [first: number, second: string];
    namedBlockA: [first: typeof ClassA];
    namedBlockB: [boolean];
  };
}> {}
```

```hbs live no-shadow preview below
<ComponentSignature
  @module='src/browser/private/samples'
  @name='ClassA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>Reference (not currently supported)</summary>

```gts
export class ClassB extends Component<SignatureA> {}
```

```hbs live no-shadow
<ComponentSignature
  @module='src/browser/private/samples'
  @name='ClassB'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>TemplateOnly w/ Reference (not currently supported)</summary>

```gts
export const TemplateOnlyC: TOC<SignatureA> = <template>...</template>;
```

```hbs live no-shadow
<ComponentSignature
  @module='src/browser/private/samples'
  @name='TemplateOnlyC'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>TemplateOnly w/ Inline</summary>

```gts
export const TemplateOnlyD: TOC<{
  Element: HTMLDivElement;
  Args: {
    foo: number;
    bar: string;
  };
  Blocks: {
    default: [first: number, second: string];
    namedBlockA: [first: typeof ClassA];
    namedBlockB: [boolean];
  };
}> = <template>hi</template>;
```

```hbs live no-shadow preview below
<ComponentSignature
  @module='src/browser/private/samples'
  @name='TemplateOnlyD'
  @package='kolay'
/>
```

</fieldset>
