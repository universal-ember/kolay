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

```hbs live no-shadow
<ComponentSignature
  @module='src/browser/private/samples'
  @name='SignatureA'
  @package='kolay'
/>
```

</fieldset>

<fieldset>
  <summary>Inline</summary>

```hbs live no-shadow
<ComponentSignature
  @module='src/browser/private/samples'
  @name='ClassA'
  @package='kolay'
/>
```

</fieldset>
