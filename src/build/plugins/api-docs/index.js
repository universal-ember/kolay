import { stripIndent } from 'common-tags';

import { virtualFile } from '../helpers.js';
import { generateTypeDocJSON } from './typedoc.js';

const SECRET_INTERNAL_IMPORT = 'kolay/api-docs:virtual';

/**
 * All packages contributed by every `apiDocs()` usage in the config, mapped
 * to the `dest` of the usage that declared them (first usage wins on
 * duplicates).
 *
 * @return {Map<string, string | undefined>}
 */
function allPackages(state) {
  const seen = new Map();

  for (const usage of state.usages) {
    for (const pkg of usage.packages ?? []) {
      if (!seen.has(pkg)) {
        seen.set(pkg, usage.dest);
      }
    }
  }

  return seen;
}

/**
 * @param {string} pkgName - a package name or relative path
 * @param {string | undefined} dest
 */
function getDest(pkgName, dest) {
  const flat = pkgName.replace(/^\.\//, '').replaceAll('/', '__');

  return `${dest ?? 'docs'}/${flat}.json`;
}

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

                const pkg = [...allPackages(state)].find(([pkgName, dest]) => {
                  return baseUrl + getDest(pkgName, dest) === assetUrl;
                });

                if (pkg) {
                  const data = await generateTypeDocJSON({ packageName: pkg[0] });

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
        [...allPackages(state)].map(async ([pkgName, destOption]) => {
          let seen = cache.get(pkgName);

          if (!seen) {
            seen = generateTypeDocJSON({ packageName: pkgName });
            cache.set(pkgName, seen);
          }

          const data = await seen;

          if (data) {
            const dest = getDest(pkgName, destOption);

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
      get content() {
        const packages = [...allPackages(state)];

        return stripIndent`
          export const packageNames = [
            ${packages.map(([pkgName]) => `'${pkgName}',`).join('\n  ')}
          ];

          export const loadApiDocs = {
            ${packages
              .map(([pkgName, dest]) => {
                return `'${pkgName}': () => fetch('${baseUrl}${getDest(pkgName, dest)}'),`;
              })
              .join('\n  ')}
          };
        `;
      },
    }),
  };
};
