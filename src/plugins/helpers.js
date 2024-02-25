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
 * @param {VirtualFileOptions | VirtualFileOptions[]} options
 * @return {Omit<import('unplugin').UnpluginOptions, 'name'>}
 */
export function virtualFile(options) {
  const opts = Array.isArray(options) ? options : [options];

  opts.forEach((opt, i) => {
    assert(opt.importPath, `Must pass \`importPath\` to virtualFile:${i}`);
    assert(opt.content, `Must pass \`content\` to virtualFile:${i}`);
  });

  const imports = opts.map((opt) => opt.importPath);
  const allowed = new Set(imports);

  return {
    resolveId(id) {
      if (allowed.has(id)) {
        return {
          id: `\0${id}`,
        };
      }

      return;
    },
    loadInclude(id) {
      if (!id.startsWith('\0')) return false;

      return allowed.has(id.slice(1));
    },
    load(id) {
      if (!id.startsWith('\0')) return;

      let importPath = id.slice(1);

      if (!allowed.has(importPath)) return;

      let opt = opts.find((opt) => opt.importPath === importPath);

      assert(opt, `Could not find content for ${opt?.importPath}`);

      return opt.content;
    },
  };
}
