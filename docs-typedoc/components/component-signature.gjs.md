# `<ComponentSignature />`

Render the docs generated from Comments, [JSDoc](https://jsdoc.app/), etc, specialized specifically for components, which have a known signature format, consisting of `Args`, `Element` and `Blocks`.

This, along with the other API doc-related components, are powered by [TypeDoc](https://typedoc.org/) and generated from declarations.


All codeblocks in the in-source documentation support the same meta flags as [ember-repl](https://limber.glimdown.com/docs/ember-repl) / [repl-sdk](https://limber.glimdown.com/docs/repl-sdk) -- which means you can render not only snippets of code with examples, but live demos in Ember, Mermaid, React, Svelte, and Vue (and likely more in the future, whatever ember-repl / repl-sdk supports). See [the docs for Page nav](/Runtime/navigation/page-nav.md) for an example of this in action.

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

`WithBoundArgs<typeof ClassA, 'foo'>` describes what is left of `<ClassA>` after `@foo` has already been passed -- it names the args that a consumer *cannot* pass, which is the inverse of what a reader needs.

So these render as the bound component's own signature, without the args that are already bound.

These are the two components being bound below -- a class, and a `ComponentLike` alias:

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

```gts
export type ClassC = ComponentLike<SignatureC>;
```

<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='ClassC'
  @package='kolay'
/>

And this is what binding them looks like. `namedBlockC` binds every arg of `<ClassA>`, so nothing is left to pass; `namedBlockE` binds only `@foo`, leaving `@bar`. `namedBlockD` binds `<ClassC>`, whose signature is this same one -- a component that hands back a bound copy of itself stops expanding once it has been rendered.

```gts
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

Components that aren't part of the generated docs (not exported, or from a package that isn't documented) have no signature to render, so they are only named.

</fieldset>

<fieldset>
  <summary>Yielded modifiers and helpers</summary>

Anything yielded is labelled with what it *is* -- a component, a modifier, a helper, or a function -- so `ComponentLike`, `ModifierLike`, `HelperLike` and the rest of the Glint plumbing don't have to be read as type names.

Modifiers and helpers can be bound the same way components are, and render in their own shape: a modifier keeps its Element and positional args, a helper keeps its Return.

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

A component signature can be a discriminated union to express multiple usage modes. Each variant is rendered separately.

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
