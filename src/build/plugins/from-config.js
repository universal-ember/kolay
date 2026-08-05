import { dirname, resolve } from 'node:path';

import { apiDocs, demos, docs, importEntrypoints } from './index.js';
import { loadKolayConfig } from './kolay-config.js';

/**
 * @typedef {import('./kolay-config.js').KolayConfig} KolayConfig
 */

/**
 * @param {unknown} value
 * @returns {any[]}
 */
function toArray(value) {
  if (value === undefined) return [];

  return Array.isArray(value) ? value : [value];
}

/**
 * Relative paths in the config file resolve from the file's own
 * directory; everything else (absolute paths, file URLs, package
 * names) passes through.
 *
 * @param {string} configDir
 * @param {unknown} src
 */
function resolveFrom(configDir, src) {
  if (typeof src !== 'string') return src;

  return src.startsWith('./') || src.startsWith('../') ? resolve(configDir, src) : src;
}

/**
 * The plugins a kolay config describes: one `docs()` per `docs` entry
 * (or a single group-less one, so the co-located pages and the virtual
 * modules are always served), plus `apiDocs()`, `demos()`, and
 * `importEntrypoints()` when configured.
 *
 * `markdownOptions` is shared by every docs entry; an entry's own
 * options win.
 *
 * @param {KolayConfig} config
 * @param {string} configDir
 */
export function pluginsFromConfig(config, configDir) {
  const markdownOptions = config.markdownOptions ?? {};
  const plugins = [];

  const docsEntries = toArray(config.docs);

  if (docsEntries.length === 0) {
    plugins.push(docs.vite([undefined, { ...markdownOptions }]));
  }

  for (const entry of docsEntries) {
    if (typeof entry === 'string') {
      plugins.push(docs.vite([resolveFrom(configDir, entry), { ...markdownOptions }]));
      continue;
    }

    const { name, src, ...overrides } = entry ?? {};

    plugins.push(
      docs.vite([name, { src: resolveFrom(configDir, src), ...markdownOptions, ...overrides }])
    );
  }

  const apiDocsPackages = toArray(config.apiDocs);

  if (apiDocsPackages.length > 0) {
    plugins.push(apiDocs.vite(apiDocsPackages.map((pkg) => resolveFrom(configDir, pkg))));
  }

  for (const entry of toArray(config.demos)) {
    const { src, ...options } = entry ?? {};

    plugins.push(demos.vite([resolveFrom(configDir, src), options]));
  }

  for (const entry of toArray(config.importEntrypoints)) {
    if (typeof entry === 'string') {
      plugins.push(importEntrypoints.vite([resolveFrom(configDir, entry), undefined]));
      continue;
    }

    const { input, ...options } = entry ?? {};

    plugins.push(importEntrypoints.vite([resolveFrom(configDir, input), options]));
  }

  return plugins;
}

/**
 * The all-in-one plugin: discovers the project's kolay config file and
 * generates the `docs()`, `apiDocs()`, `demos()`, and
 * `importEntrypoints()` plugins it describes.
 *
 * ```js
 * // vite.config.js
 * import { kolay } from 'kolay/vite';
 *
 * export default defineConfig({
 *   plugins: [ember(), kolay()],
 * });
 * ```
 *
 * The individual plugins remain available and compose with this one —
 * their usages and the generated ones discover each other the same way
 * multiple direct usages do.
 */
export async function kolay() {
  const cwd = process.cwd();
  const { config, filepath } = await loadKolayConfig(cwd);

  return pluginsFromConfig(config, filepath ? dirname(filepath) : cwd);
}
