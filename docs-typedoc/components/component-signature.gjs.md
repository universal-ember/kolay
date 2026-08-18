# `<ComponentSignature />`

This component shows the docs that come from your comments and your [JSDoc](https://jsdoc.app/). It is for a component, which has a known signature format of `Args`, `Element`, and `Blocks`.

This component, and the other api docs components, use [TypeDoc](https://typedoc.org/). TypeDoc reads your type declarations.


Every code block in your source documentation accepts the same meta flags as [ember-repl](https://limber.glimdown.com/docs/ember-repl) and [repl-sdk](https://limber.glimdown.com/docs/repl-sdk). So a code block can be a snippet, or a live demo in Ember, Mermaid, React, Svelte, or Vue. ember-repl and repl-sdk can add more targets later. For an example, read [the docs for Page nav](/Runtime/navigation/page-nav.md).

## API Reference

```hbs live no-shadow
<ComponentSignature
  @module='declarations/browser'
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

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='SignatureA'
  @package='kolay'
/>

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

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='ClassA'
  @package='kolay'
/>

</fieldset>

<fieldset>
  <summary>Reference</summary>

```gts
export interface SignatureA {}
export class ClassB extends Component<SignatureA> {}
```

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='ClassB'
  @package='kolay'
/>


</fieldset>

<fieldset>
  <summary>TemplateOnly w/ Reference</summary>

```gts
export interface SignatureA { ... }
export const TemplateOnlyC: TOC<SignatureA> = <template>...</template>;
```


<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='TemplateOnlyC'
  @package='kolay'
/>


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

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='TemplateOnlyD'
  @package='kolay'
/>


</fieldset>

<fieldset>
  <summary>Yielded components (`WithBoundArgs`)</summary>

`WithBoundArgs` names the args that a consumer *cannot* pass. The bound component then renders with its own signature, without those args. A bound component that points back to the signature that holds it is marked `recursive`.

```gts
export type ClassC = ComponentLike<SignatureC>;

export interface SignatureC {
  Element: HTMLDivElement;
  Args: ArgsC;
  Blocks: {
    namedBlockC: [WithBoundArgs<typeof ClassA, 'foo' | 'bar'>];
    namedBlockD: [WithBoundArgs<ClassC, 'foo' | 'bar'>];
    namedBlockE: [WithBoundArgs<typeof ClassA, 'foo'>];
  };
}
```

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='SignatureC'
  @package='kolay'
/>

</fieldset>

<fieldset>
  <summary>Yielded modifiers and helpers</summary>

Each yielded value has a label with its kind: component, modifier, helper, or function. A modifier and a helper can also be bound, and each renders in its own shape.

```gts
export interface YieldsInvokables {
  Blocks: {
    default: [
      component: ComponentLike<SignatureA>,
      modifier: ModifierLike<ModifierSignatureA>,
      helper: HelperLike<ESignature>,
      boundComponent: WithBoundArgs<typeof ClassA, 'foo'>,
      boundModifier: WithBoundArgs<typeof functionModifierC, 'invert'>,
      boundHelper: WithBoundArgs<typeof helperLikeB, 'optional'>,
      onChange: (value: string) => void,
    ];
  };
}
```

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='YieldsInvokables'
  @package='kolay'
/>

</fieldset>

<fieldset>
  <summary>Union Type (Discriminated Union)</summary>

A component signature can be a discriminated union, which gives the component more than one usage mode. Kolay renders each variant separately.

```gts
export type UnionSignature =
  | {
      Element: HTMLDivElement;
      Args: {
        status?: 'complete' | 'current' | 'incomplete';
        indicator: string | ComponentLike;
      };
      Blocks: {
        default: [];
      };
    }
  | {
      Element: HTMLDivElement;
      Args: {
        status?: 'complete' | 'current' | 'incomplete';
      };
      Blocks: {
        indicator: [];
        summary: [];
        content: [];
      };
    };
```

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='UnionSignature'
  @package='kolay'
/>


</fieldset>
