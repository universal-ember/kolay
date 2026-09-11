import { execSync } from 'node:child_process';

/**
 * A build-time utulity, used for getting the short version of the git SHA.
 *
 * Could be used to hide somewhere in your app so that you know what specific version is deployed.
 *
 * In an ESM environment, you can import this module:
 * ```js
 * import { gitRef } from 'kolay/build';
 *
 * // in some config
 * version: gitRef()
 * ```
 *
 * In a CJS environment, you'd require this module:
 * ```js
 * const { gitRef } = require('kolay/build/legacy');
 *
 * // in some config
 * version: gitRef()
 * ```
 *
 */
export function gitRef() {
  const scriptOutput = execSync('git rev-parse --short HEAD', {
    encoding: 'utf-8',
  });

  return scriptOutput.trim();
}
