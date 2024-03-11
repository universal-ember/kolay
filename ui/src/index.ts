// Required to *sanely* use typedoc data
export {
  APIDocs,
  CommentQuery,
  ComponentSignature,
} from './markdown/typedoc/index.ts';

// Required to use Kolay
export { Compiled } from './markdown/index.ts';
export { addRoutes } from './router.ts';

// Types
export type { default as APIDocsService } from './services/kolay/api-docs.ts';
export type {
  default as DocsService,
  SetupOptions,
} from './services/kolay/docs.ts';
export type { Collection, Manifest, Page } from './services/kolay/types.ts';
