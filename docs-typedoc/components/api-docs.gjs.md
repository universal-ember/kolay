# `<APIDocs />`

This component shows the docs that come from your comments and your [JSDoc](https://jsdoc.app/).
This component, and the other api docs components, use [TypeDoc](https://typedoc.org/). TypeDoc reads your type declarations.

`APIDocs` shows the same content as `CommentQuery`. It also shows each sub-type and the docs of that sub-type, at any depth.

## API Reference

This api reference comes from:

```hbs live no-shadow preview below
<APIDocs 
  @module='declarations/browser' 
  @name='APIDocs' 
  @package='kolay' />
```

<hr />

The same component with `ComponentSignature` looks like this:


```hbs live no-shadow preview below
<ComponentSignature 
  @module='declarations/browser' 
  @name='APIDocs' 
  @package='kolay' />
```
