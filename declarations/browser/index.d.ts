import './kolay.css';
export { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature, } from './typedoc/index.ts';
export { addRoutes, handlePotentialIndexVisit } from './router.ts';
export { typedocLoader } from './services/api-docs.ts';
export { Compiled } from './services/compiler/reactive.ts';
export { docsManager } from './services/docs.ts';
export { selected } from './services/selected.ts';
export { getIndexPage, isCollection, isIndex } from './utils.ts';
export type { Collection, Manifest, Page } from '../types.ts';
export type { SetupOptions } from './services/docs.ts';
//# sourceMappingURL=index.d.ts.map