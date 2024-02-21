import { createUnplugin } from 'unplugin';

import { generateTypeDocJSON } from './typedoc.js';

/**
 * Generates JSON from typedoc given a target path.
 *
 * May be used multiple times to generate multiple docs
 * for multiple libraries
 *
 * example:
 * ```js
 * import { typedoc, helpers } from 'kolay';
 *
 * typedoc.webpack({
 *   dest: '/api-docs/ember-primitives.json
 *   entryPoints: [
 *     helpers.pkgGlob(
 *       require.resolve('ember-primitives'),
 *        'declarations'
 *      )
 *   ]
 * })
 * ```
 */
export const apiDocs = createUnplugin(
  /**
   * @param {import('./types.ts').APIDocsOptions} options
   */
  (options) => {
    const name = 'kolay::typedoc';

    return {
      name,
      /**
       * 1. generate typedoc config
       * 2. given the
       */
      async buildEnd() {
        await Promise.all(
          options.packages.map(async (pkgName) => {
            let data = await generateTypeDocJSON({ packageName: pkgName });

            if (data) {
              let dest = `${options.dest ?? 'docs'}/${pkgName}.json`;

              this.emitFile({
                type: 'asset',
                fileName: dest,
                source: JSON.stringify(data),
              });
            }
          })
        );
      },
    };
  }
);
