import { createUnplugin } from 'unplugin';

import { apiDocs } from './api-docs/index.js';
import { validatePackages } from './api-docs/validate.js';
import { gjsmd } from './gjs-md.js';
import { setup } from './setup.js';
import { fixViteForIssue362 } from './vite-issue-362.js';

/**
 * @typedef {object} DocsOptions
 * @property {Array<{ name: string, src: string }>} [groups] - markdown sources; each group's pages are served under the group's name
 * @property {unknown[]} [remarkPlugins] - remark plugins for this usage's `.gjs.md` files
 * @property {unknown[]} [rehypePlugins] - rehype plugins for this usage's `.gjs.md` files
 * @property {string} [scope] - import statements made available in this usage's live codefences
 *
 * @typedef {object} TypedocOptions
 * @property {string[]} packages - packages to generate typedoc JSON for
 * @property {string} [dest] - where the JSON is served/emitted (default: 'docs')
 *
 * @typedef {DocsOptions & Partial<TypedocOptions>} Options
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
 * The markdown-docs plugin: slurps up `.md` / `.gjs.md` files from the
 * configured groups, produces the manifest + page loaders
 * ('kolay/compiled-docs:virtual'), compiles `.gjs.md` at build time,
 * and serves/emits co-located doc assets.
 *
 * @param {DocsOptions} options
 */
export function docsPlugins(options) {
  const state = createState(options);

  return [setup(state), fixViteForIssue362(), gjsmd(state)].filter(Boolean);
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
 * @param {Options} options
 * @type {import('unplugin').UnpluginFactory<Options>}
 */
export function combinedPlugins(options) {
  return [
    ...docsPlugins(options),
    // pre-split behavior: no validation, and `dest` stays configurable
    apiDocs(createState({ packages: options.packages ?? [], dest: options.dest })),
  ];
}

export const docs = /* #__PURE__ */ createUnplugin(docsPlugins);

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
