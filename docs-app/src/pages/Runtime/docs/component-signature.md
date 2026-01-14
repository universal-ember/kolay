---
layout: ../../../layouts/MarkdownLayout.astro
title: Component Signature
---

# `<ComponentSignature />`

Render the docs generated from Comments, [JSDoc](https://jsdoc.app/), etc, specialized specifically for components, which have a known signature format, consisting of `Args`, `Element` and `Blocks`.

This, along with the other API doc-related components, are powered by [TypeDoc](https://typedoc.org/) and generated from declarations.


All codeblocks in the in-source documentation support the same meta flags as [ember-repl](https://limber.glimdown.com/docs/ember-repl) / [repl-sdk](https://limber.glimdown.com/docs/repl-sdk) -- which means you can render not only snippets of code with examples, but live demos in Ember, Mermaid, React, Svelte, and Vue (and likely more in the future, whatever ember-repl / repl-sdk supports). See [the docs for Page nav](/Runtime/util/page-nav.md) for an example of this in action.

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

```hbs live no-shadow preview below
<ComponentSignature
  @module='declarations/browser/samples/-private'
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
  @module='declarations/browser/samples/-private'
  @name='ClassA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>Reference</summary>

```gts
export interface SignatureA {}
export class ClassB extends Component<SignatureA> {}
```

```hbs live no-shadow
<ComponentSignature
  @module='declarations/browser/samples/-private'
  @name='ClassB'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>TemplateOnly w/ Reference</summary>

```gts
export interface SignatureA { ... }
export const TemplateOnlyC: TOC<SignatureA> = <template>...</template>;
```

```hbs live no-shadow
<ComponentSignature
  @module='declarations/browser/samples/-private'
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
  @module='declarations/browser/samples/-private'
  @name='TemplateOnlyD'
  @package='kolay'
/>
```

</fieldset>
