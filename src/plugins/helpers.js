import assert from 'node:assert';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

import { packageUp } from 'package-up';

const require = createRequire(import.meta.url);

/**
 * @param {string} packageName
 */
export async function packageTypes(packageName) {
  let entryPath = require.resolve(packageName, {
    paths: [process.cwd()],
  });

  let manifestPath = await packageUp({ cwd: entryPath });

  assert(
    manifestPath,
    `Could not find package.json for ${packageName}. Tried looking upward from ${entryPath}`
  );

  let manifest = require(manifestPath);
  let dir = dirname(manifestPath);

  let types = extractExports(manifest.exports, 'types');

  return {
    manifest,
    dir,
    types,
  };
}

/**
 *
 * @param {object} exports
 * @param {string} kind
 * @returns {string[]}
 */
function extractExports(exports, kind) {
  let result = [];

  for (let [key, config] of Object.entries(exports)) {
    if (typeof config === 'object') {
      result.push(...extractExports(config, kind));
      continue;
    }

    if (key === kind) {
      result.push(config);
    }
  }

  return result;
}

/**
 * @typedef {object} VirtualFileOptions
 * @property {string} importPath
 * @property {string} content
 *
 * @param {VirtualFileOptions} options
 * @return {Omit<import('unplugin').UnpluginOptions, 'name'>}
 */
export function virtualFile(options) {
  assert(options.importPath, 'Must pass `importPath` to virtualFile');
  assert(options.content, 'Must pass `content` to virtualFile');

  return {
    resolveId(id) {
      if (id === options.importPath) {
        return {
          id: `\0${id}`,
        };
      }

      return;
    },
    loadInclude(id) {
      if (!id.startsWith('\0')) return false;

      return id.slice(1) === options.importPath;
    },
    load(id) {
      if (!id.startsWith('\0')) return;

      if (id.slice(1) !== options.importPath) return;

      return options.content;
    },
  };
}
