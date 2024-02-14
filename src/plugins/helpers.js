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
