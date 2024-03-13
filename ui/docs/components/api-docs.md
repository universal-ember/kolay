# `<APIDocs />`

Render the docs generated from Comments, [JSDoc](https://jsdoc.app/), etc.
This, along with the other API doc-related components, are powered by [TypeDoc](https://typedoc.org/) and generated from declarations.

`APIDocs` will include the same content as `CommentQuery`, but also recursively include sub-types and their documentation.

## API Reference

API Reference generated via:

```hbs live no-shadow preview below
<APIDocs @module='src/browser/re-exports' @name='APIDocs' @package='kolay' />
```
