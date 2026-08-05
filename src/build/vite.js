import {
  apiDocs as _apiDocs,
  demos as _demos,
  docs as _docs,
  importEntrypoints as _importEntrypoints,
} from './plugins/index.js';

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
 * `demos(import.meta.resolve('./demos'), { as: '#demos/foo' })` enables
 * `import ... from '#demos/foo/<demo>'` in live codefences.
 * The runtime compiler learns the aliases automatically, so `.md`
 * fences need no `modules` configuration.
 *
 * @param {string} src - where the demos live (a path, or an `import.meta.resolve()`d URL)
 * @param {{ as: string }} options
 */
export function demos(src, options) {
  return _demos.vite([src, options]);
}

/**
 * The import-entrypoints plugin: enumerates a package's
 * package.json#exports and teaches the runtime compiler every
 * entrypoint — `importEntrypoints('ember-primitives')` lets `.md`
 * live codefences `import ... from 'ember-primitives/<anything>'`
 * with no `modules` configuration.
 *
 * @param {string} input - a package name, or a path to a directory containing a package.json
 * @param {{ exclude?: string[] }} [options] - subpath keys to leave out (exact, or ending in '*') — e.g. node-only entrypoints
 */
export function importEntrypoints(input, options) {
  return _importEntrypoints.vite([input, options]);
}

/**
 * Opt-in rehype plugin that wraps every demo in a `<WrapDemo>` component
 * resolved from scope — pass it to a `docs()` usage's `rehypePlugins` and
 * bind your own `WrapDemo` in that usage's `scope`.
 *
 * (For runtime-compiled `.md` pages, pass the same plugin — re-exported
 * from 'kolay/wrap-demo' — to `setupKolay`'s `rehypePlugins`.)
 */
export { rehypeWrapDemos } from '../wrap-demos.js';
