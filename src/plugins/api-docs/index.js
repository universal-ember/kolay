import { stripIndent } from 'common-tags';

import { virtualFile } from '../helpers.js';
import { generateTypeDocJSON } from './typedoc.js';

const SECRET_INTERNAL_IMPORT = 'kolay/api-docs:virtual';

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
 *
 * @type {(options: import('./types.ts').APIDocsOptions) => import('unplugin').UnpluginOptions}
 */
export const apiDocs = (options) => {
  const name = 'kolay-api-docs';

  /**
   * @param {string} pkgName
   */
  function getDest(pkgName) {
    return `${options.dest ?? 'docs'}/${pkgName.replace('/', '__')}.json`;
  }

  let baseUrl = '/';

  return {
    name,

    vite: {
      configResolved(resolvedConfig) {
        baseUrl = resolvedConfig.base;
      },
      configureServer(server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (req.originalUrl && req.originalUrl.length > 1) {
              const assetUrl = req.originalUrl.split('?')[0];

              const pkg = options.packages.find((pkgName) => {
                let dest = baseUrl + getDest(pkgName);

                return dest === assetUrl;
              });

              if (pkg) {
                let data = await generateTypeDocJSON({ packageName: pkg });

                res.setHeader('content-type', 'application/json');

                return res.end(JSON.stringify(data));
              }
            }

            return next();
          });
        };
      },
    },

    /**
     * 1. generate typedoc config
     * 2. given the
     */
    async buildEnd() {
      await Promise.all(
        options.packages.map(async (pkgName) => {
          let data = await generateTypeDocJSON({ packageName: pkgName });

          if (data) {
            let dest = getDest(pkgName);

            this.emitFile({
              type: 'asset',
              fileName: dest,
              source: JSON.stringify(data),
            });
          }
        })
      );
    },
    ...virtualFile({
      importPath: SECRET_INTERNAL_IMPORT,
      content: stripIndent`
          export const packageNames = [
            ${options.packages.map((raw) => `'${raw}',`).join('\n  ')}
          ];

          export const loadApiDocs = {
            ${options.packages
              .map((name) => {
                return `'${name}': () => fetch('${baseUrl}${getDest(name)}'),`;
              })
              .join('\n  ')}
          };
        `,
    }),
  };
};
