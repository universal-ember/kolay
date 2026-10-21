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
export function gitRef(): string;
//# sourceMappingURL=git-ref.d.ts.map