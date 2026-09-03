import { stripIndent } from 'common-tags';

import { virtualFile } from '../helpers.js';
import { generateTypeDocJSON } from './typedoc.js';

const SECRET_INTERNAL_IMPORT = 'kolay/api-docs:virtual';

/**
 * All packages contributed by every `apiDocs()` usage in the config
 * (first usage wins on duplicates).
 *
 * @return {string[]}
 */
function allPackages(state) {
  const seen = new Set();

  for (const usage of state.usages) {
    for (const pkg of usage.packages ?? []) {
      seen.add(pkg);
    }
  }

  return [...seen];
}

/**
 * @param {string} pkgName - a package name or relative path
 */
function getDest(pkgName) {
  const flat = pkgName.replace(/^\.\//, '').replaceAll('/', '__');

  return `docs/${flat}.json`;
}

/**
 * Generates typedoc JSON for the given packages and provides
 * 'kolay/api-docs:virtual' for loading it. See the public `apiDocs()`
 * entry in ./combined.js:
 *
 * ```js
 * import { docs, apiDocs } from 'kolay/vite';
 *
 * apiDocs(['ember-primitives', './packages/my-library']);
 * ```
 *
 * @type {(state: { options: object, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions}
 */
export const apiDocs = (state) => {
  const name = 'kolay:apidocs';

  /**
   * @type {Map<string, Promise>}
   */
  const cache = new Map();

  let baseUrl = '/';

  /**
   * @type {import('unplugin').JsPluginExtended}
   */
  return {
    name,

    vite: {
      api: { kolay: state },
      configResolved(resolvedConfig) {
        baseUrl = resolvedConfig.base;

        if (!resolvedConfig.plugins.some((plugin) => plugin.name === 'kolay:setup')) {
          throw new Error(
            `The apiDocs() plugin requires the docs() plugin (both from 'kolay/vite') to also be in the plugins array.`
          );
        }

        /**
         * Discover every apiDocs() usage in this config — the plugin may
         * be used multiple times. All usages contribute to one
         * 'kolay/api-docs:virtual', served by the first ("primary") usage.
         */
        const states = resolvedConfig.plugins
          .filter((plugin) => plugin.name === name)
          .map((plugin) => plugin.api?.kolay)
          .filter(Boolean);

        if (states.length > 1) {
          const usages = states.map((usageState) => usageState.options);

          states.forEach((usageState, i) => {
            usageState.usages = usages;
            usageState.isPrimary = i === 0;
          });
        }
      },
      configureServer(server) {
        return () => {
          // configResolved has run: the primary usage serves every usage's packages
          if (!state.isPrimary) return;

          server.middlewares.use(async (req, res, next) => {
            try {
              if (req.originalUrl && req.originalUrl.length > 1) {
                const assetUrl = req.originalUrl.split('?')[0];

                const pkg = allPackages(state).find((pkgName) => {
                  return baseUrl + getDest(pkgName) === assetUrl;
                });

                if (pkg) {
                  const data = await generateTypeDocJSON({ packageName: pkg });

                  res.setHeader('content-type', 'application/json');

                  return res.end(JSON.stringify(data));
                }
              }
            } catch (e) {
              console.error(e);
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
      if (!state.isPrimary) return;

      await Promise.all(
        allPackages(state).map(async (pkgName) => {
          let seen = cache.get(pkgName);

          if (!seen) {
            seen = generateTypeDocJSON({ packageName: pkgName });
            cache.set(pkgName, seen);
          }

          const data = await seen;

          if (data) {
            this.emitFile({
              type: 'asset',
              fileName: getDest(pkgName),
              source: JSON.stringify(data),
            });
          }
        })
      );
    },
    ...virtualFile({
      importPath: SECRET_INTERNAL_IMPORT,
      get content() {
        const packages = allPackages(state);

        return stripIndent`
          export const packageNames = [
            ${packages.map((pkgName) => `'${pkgName}',`).join('\n  ')}
          ];

          export const loadApiDocs = {
            ${packages
              .map((pkgName) => {
                return `'${pkgName}': () => fetch('${baseUrl}${getDest(pkgName)}'),`;
              })
              .join('\n  ')}
          };
        `;
      },
    }),
  };
};
