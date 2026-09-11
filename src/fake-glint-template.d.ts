// this file should only be used by doctype to render WithBoundArgs/WithBoundPositionals
// this re-exports most things , except WithBoundArgs, WithBoundPositionals so that doctype will
// render the type as `WithBoundArgs<MyComp, 'foo' | 'bar'>`
declare module '@glint/template' {
  export type HelperLike<T> = import('@glint/template/-private/index').HelperLike<T>;
  export type ModifierLike<T> = import('@glint/template/-private/index').ModifierLike<T>;
  export type ComponentLike<T> = import('@glint/template/-private/index').ComponentLike<T>;
  export type AttrValue = import('@glint/template/-private/index').AttrValue;
  export type ContentValue = import('@glint/template/-private/index').ContentValue;
}
