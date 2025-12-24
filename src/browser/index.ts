import './kolay.css';

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
export { typedocLoader } from './services/api-docs.ts';
export { Compiled } from './services/compiler/reactive.ts';
export { docsManager } from './services/docs.ts';
export { selected } from './services/selected.ts';

// Utilities
export * from './utils.ts';

// Types
export type { Collection, Manifest, Page } from '../types.ts';
export type { SetupOptions } from './services/docs.ts';
