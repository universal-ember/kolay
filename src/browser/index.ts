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
export { loadCompiledDocs } from './load-compiled-docs.ts';
export { addRoutes, handlePotentialIndexVisit } from './router.ts';
export { typedocLoader } from './services/api-docs.ts';
export { CompiledDoc, compiledDoc } from './services/compiled-doc.ts';
export { Compiled } from './services/compiler/reactive.ts';
export { docsManager } from './services/docs.ts';
export { searcher } from './services/search.ts';
export { selected } from './services/selected.ts';

// Utilities
export { isActive } from './is-active.ts';
export { resolveRedirect } from './redirects.ts';
export { highlightSearch } from './services/search/highlight.ts';
export { stripFormatting } from './services/search/strip-formatting.ts';
export { isIndex, isPageTree } from './utils.ts';

// Types
export type { Manifest, Page, PageTree, SearchResult } from '../types.ts';
export type { DocsGroupModule, DocsSourceMeta, MetaManifest } from './load-compiled-docs.ts';
export type { DocModule, DocSource } from './services/compiled-doc.ts';
export type { SetupOptions } from './services/docs.ts';
export type { DocsService } from './services/docs.ts';
export type { SearchService } from './services/search.ts';
export type { Selected } from './services/selected.ts';
