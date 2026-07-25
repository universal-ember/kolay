import { apiDocs as _apiDocs, docs as _docs, kolay as _kolay } from './plugins/index.js';

/**
 * The markdown-docs plugin.
 */
export const docs = _docs.vite;

/**
 * The api-docs plugin (requires `docs` to also be used).
 */
export const apiDocs = _apiDocs.vite;

/**
 * @deprecated renamed — use `apiDocs`.
 */
export const typedoc = _apiDocs.vite;

/**
 * @deprecated use `docs` (and `typedoc`, if you have `packages`) instead.
 */
export const kolay = _kolay.vite;
