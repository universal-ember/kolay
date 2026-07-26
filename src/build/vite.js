import { apiDocs as _apiDocs, demos as _demos, docs as _docs } from './plugins/index.js';

/**
 * The markdown-docs plugin. One usage per group:
 *
 * - `docs('guides', { src: import.meta.resolve('./guides') })`
 * - `docs(import.meta.resolve('./guides'))` — a path or URL: its last
 *   segment is the group name
 * - `docs()` — no group; only the co-located pages (app/templates, src/templates)
 *
 * @param {string | import('./plugins/docs-args.js').DocsOptions} [groupName] - the group's name, or a path/URL whose last segment is the group name (the path then also serves as the group's `src`)
 * @param {import('./plugins/docs-args.js').DocsOptions} [options]
 */
export function docs(groupName, options) {
  return _docs.vite([groupName, options]);
}

/**
 * The api-docs plugin (requires `docs` to also be used).
 */
export const apiDocs = _apiDocs.vite;

/**
 * The demos plugin: aliases a directory of demo components so code
 * fences can import them —
 *
 * `demos(import.meta.resolve('./demos'), { as: 'demos/foo' })` enables
 * `import ... from 'virtual:demos/foo/<demo>'` in live codefences.
 * The runtime compiler learns the aliases automatically, so `.md`
 * fences need no `modules` configuration.
 *
 * @param {string} src - where the demos live (a path, or an `import.meta.resolve()`d URL)
 * @param {{ as: string }} options
 */
export function demos(src, options) {
  return _demos.vite([src, options]);
}
