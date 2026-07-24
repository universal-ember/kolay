import { createUnplugin } from 'unplugin';

import { apiDocs } from './api-docs/index.js';
import { gjsmd } from './gjs-md.js';
import { setup } from './setup.js';
import { fixViteForIssue362 } from './vite-issue-362.js';

/**
 * @typedef {object} DocsOptions
 * @property {Array<{ name: string, src: string }>} [groups] - markdown sources; each group's pages are served under the group's name
 * @property {unknown[]} [remarkPlugins] - remark plugins for `.gjs.md` files
 * @property {unknown[]} [rehypePlugins] - rehype plugins for `.gjs.md` files
 * @property {string} [scope] - import statements made available in live codefences
 *
 * @typedef {object} TypedocOptions
 * @property {string[]} packages - packages to generate typedoc JSON for
 * @property {string} [dest] - where the JSON is served/emitted (default: 'docs')
 *
 * @typedef {DocsOptions & Partial<TypedocOptions>} Options
 */

/**
 * The markdown-docs plugin: slurps up `.md` / `.gjs.md` files from the
 * configured groups, produces the manifest + page loaders
 * ('kolay/compiled-docs:virtual'), compiles `.gjs.md` at build time,
 * and serves/emits co-located doc assets.
 *
 * @param {DocsOptions} options
 */
export function docsPlugins(options) {
  return [
    setup({
      groups: options.groups ?? [],
    }),
    fixViteForIssue362(),
    gjsmd({
      remarkPlugins: options.remarkPlugins,
      rehypePlugins: options.rehypePlugins,
      scope: options.scope,
    }),
  ].filter(Boolean);
}

/**
 * The api-docs plugin: generates typedoc JSON for the configured
 * `packages` and provides 'kolay/api-docs:virtual' for loading it.
 *
 * Requires the `docs()` plugin to also be present.
 *
 * @param {TypedocOptions} options
 */
export function typedocPlugins(options) {
  return [apiDocs({ packages: options.packages ?? [], dest: options.dest })].filter(Boolean);
}

/**
 * @deprecated use `docs()` (and `typedoc()`, if you have `packages`) instead.
 *
 * @param {Options} options
 * @type {import('unplugin').UnpluginFactory<Options>}
 */
export function combinedPlugins(options) {
  return [...docsPlugins(options), ...typedocPlugins(options)];
}

export const docs = /* #__PURE__ */ createUnplugin(docsPlugins);
export const typedoc = /* #__PURE__ */ createUnplugin(typedocPlugins);

/**
 * @deprecated use `docs` (and `typedoc`, if you have `packages`) instead.
 */
export const combined = /* #__PURE__ */ createUnplugin(combinedPlugins);
