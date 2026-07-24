import { docs as _docs, kolay as _kolay, typedoc as _typedoc } from './plugins/index.js';

/**
 * The markdown-docs plugin.
 */
export const docs = _docs.vite;

/**
 * The api-docs plugin (requires `docs` to also be used).
 */
export const typedoc = _typedoc.vite;

/**
 * @deprecated use `docs` (and `typedoc`, if you have `packages`) instead.
 */
export const kolay = _kolay.vite;
