import { createUnplugin } from 'unplugin';

import { apiDocs } from './api-docs/index.js';
import { validatePackages } from './api-docs/validate.js';
import { parseDocsArgs } from './docs-args.js';
import { gjsmd } from './gjs-md.js';
import { docsVirtualGuard, setup } from './setup.js';
import { fixViteForIssue362 } from './vite-issue-362.js';

/**
 * @typedef {import('./docs-args.js').DocsOptions} DocsOptions
 *
 * @typedef {object} TypedocOptions
 * @property {string[]} packages - packages to generate typedoc JSON for
 * @property {string} [dest] - where the JSON is served/emitted (default: 'docs')
 *
 * @typedef {object} LegacyOptions
 * @property {Array<{ name: string, src: string }>} [groups]
 * @property {unknown[]} [remarkPlugins]
 * @property {unknown[]} [rehypePlugins]
 * @property {string} [scope]
 * @property {string[]} [packages]
 * @property {string} [dest]
 */

/**
 * `docs()` and `apiDocs()` may each be used multiple times in one config,
 * e.g. for pulling docs from multiple sources with different markdown
 * processing.
 *
 * All usages of a plugin contribute to ONE manifest / one virtual module,
 * which is served by the first ("primary") usage. Usages discover each
 * other during vite's `configResolved` (see setup() / apiDocs()), through
 * this shared, mutable state.
 *
 * @param {object} options
 */
function createState(options) {
  return {
    options,
    /** all usages' options, in plugin order; replaced during configResolved */
    usages: [options],
    /** whether this usage serves the shared virtual modules and assets */
    isPrimary: true,
  };
}

/**
 * The markdown-docs plugin: slurps up the group's `.md` / `.gjs.md` files,
 * produces the manifest + page loaders ('kolay/compiled-docs:virtual'),
 * compiles `.gjs.md` at build time, and serves/emits co-located doc assets.
 *
 * One usage per group:
 * - `docs('guides', { src: import.meta.resolve('./guides') })`
 * - `docs(import.meta.resolve('./guides'))` — a path or URL: its last
 *   segment is the group name
 * - `docs()` — no group; only the co-located pages (app/templates, src/templates)
 *
 * @param {string | DocsOptions} [groupName] - the group's name, or a path/URL whose last segment is the group name (the path then also serves as the group's `src`)
 * @param {DocsOptions} [options]
 */
export function docsPlugins(groupName, options) {
  const state = createState(parseDocsArgs(groupName, options));

  return [setup(state), fixViteForIssue362(), gjsmd(state), docsVirtualGuard(state)].filter(
    Boolean
  );
}

/**
 * The api-docs plugin: generates typedoc JSON for the given packages
 * and provides 'kolay/api-docs:virtual' for loading it.
 *
 * Receives a string, or an array of strings — package names (which must
 * be installed / resolvable from your project) and/or relative paths
 * (which must exist). Every entry is validated up front, and all
 * problems are reported in one error.
 *
 * Requires the `docs()` plugin to also be present.
 *
 * @param {string | string[]} input
 */
export function apiDocsPlugins(input) {
  const packages = validatePackages(input, process.cwd());

  return [apiDocs(createState({ packages }))].filter(Boolean);
}

/**
 * @deprecated use `docs()` (and `apiDocs()`, if you have `packages`) instead.
 *
 * @param {LegacyOptions} options
 * @type {import('unplugin').UnpluginFactory<LegacyOptions>}
 */
export function combinedPlugins(options) {
  // pre-split behavior: multiple groups per call, no validation, and
  // `dest` stays configurable
  const state = createState(options);

  return [
    setup(state),
    fixViteForIssue362(),
    gjsmd(state),
    docsVirtualGuard(state),
    apiDocs(createState({ packages: options.packages ?? [], dest: options.dest })),
  ];
}

/**
 * unplugin factories only receive one argument, so the public two-argument
 * form (see 'kolay/vite') passes `[groupName, options]` as a tuple.
 */
export const docs = /* #__PURE__ */ createUnplugin((args) =>
  Array.isArray(args) ? docsPlugins(...args) : docsPlugins(args)
);

const apiDocsUnplugin = /* #__PURE__ */ createUnplugin(apiDocsPlugins);

export { apiDocsUnplugin as apiDocs };

/**
 * @deprecated renamed — use `apiDocs`.
 */
export const typedoc = apiDocsUnplugin;

/**
 * @deprecated use `docs` (and `apiDocs`, if you have `packages`) instead.
 */
export const combined = /* #__PURE__ */ createUnplugin(combinedPlugins);
