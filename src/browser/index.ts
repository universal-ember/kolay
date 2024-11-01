// Required to *sanely* use typedoc data
export {
  APIDocs,
  CommentQuery,
  ComponentSignature,
  HelperSignature,
  ModifierSignature,
} from './typedoc/index.ts';

// Required to use Kolay
export { addRoutes } from './router.ts';
export { Compiled } from './services/kolay/compiler/reactive.ts';

// Utilities
export * from './utils.ts';

// Types
export type { default as APIDocsService } from './services/kolay/api-docs.ts';
export type {
  default as DocsService,
  SetupOptions,
} from './services/kolay/docs.ts';
export type { Collection, Manifest, Page } from './services/kolay/types.ts';
