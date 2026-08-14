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
 * A docs entry with its paths resolved — its own `src`, and those of every
 * group it collects, however deep. A group an entry collects is a group
 * like any other, so the config file's rule for a relative path has to
 * hold at every depth.
 *
 * @param {string} configDir
 * @param {object} entry
 */
function resolveEntry(configDir, entry) {
  const { collection, src, ...rest } = entry;

  return {
    ...rest,
    ...(src === undefined ? {} : { src: resolveFrom(configDir, src) }),
    ...(collection === undefined
      ? {}
      : {
          collection: toArray(collection).map((included) =>
            typeof included === 'string'
              ? resolveFrom(configDir, included)
              : resolveEntry(configDir, included ?? {})
          ),
        }),
  };
}

/**
 * The plugins a kolay config describes: one `docs()` per `docs` entry,
 * one `demos()` / `importEntrypoints()` per entry of theirs, and one
 * `apiDocs()` for the `apiDocs` list. A key that is not specified
 * generates nothing.
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

  for (const entry of toArray(config.docs)) {
    if (typeof entry === 'string') {
      const src = resolveFrom(configDir, entry);

      plugins.push(docs.vite([src, { ...markdownOptions }]));
      continue;
    }

    const { name, ...options } = resolveEntry(configDir, entry ?? {});

    plugins.push(docs.vite([name, { ...markdownOptions, ...options }]));
  }

  const apiDocsInput = toArray(config.apiDocs);

  if (apiDocsInput.length > 0) {
    const packages = apiDocsInput.map((pkg) => resolveFrom(configDir, pkg));

    plugins.push(apiDocs.vite(packages));
  }

  for (const entry of toArray(config.demos)) {
    const { src, ...options } = entry ?? {};
    const resolvedSrc = resolveFrom(configDir, src);

    plugins.push(demos.vite([resolvedSrc, options]));
  }

  for (const entry of toArray(config.importEntrypoints)) {
    if (typeof entry === 'string') {
      const input = resolveFrom(configDir, entry);

      plugins.push(importEntrypoints.vite([input, undefined]));
      continue;
    }

    const { input, ...options } = entry ?? {};
    const resolvedInput = resolveFrom(configDir, input);

    plugins.push(importEntrypoints.vite([resolvedInput, options]));
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
