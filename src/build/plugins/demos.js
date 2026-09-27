import { existsSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { join } from 'node:path';

import { stripIndent } from 'common-tags';

import { normalizePath } from './utils.js';

/**
 * Extensions a demo may have — the alias always omits them.
 */
const DEMO_EXTENSIONS = ['gjs', 'gts', 'js', 'ts'];

const EXTENSION_PATTERN = new RegExp(`\\.(${DEMO_EXTENSIONS.join('|')})$`);

/**
 * demos() takes (pathToDemos, { as }):
 *
 * - `demos(import.meta.resolve('./demos'), { as: '#demos/foo' })`
 *
 * The `as` is the import specifier, used verbatim — any valid import
 * URI works; the `#` prefix (Node's subpath-import convention) makes
 * it unmistakably not-an-npm-package.
 *
 * @param {string} src - where the demos live (a path, or an `import.meta.resolve()`d URL)
 * @param {{ as: string }} options
 * @returns {{ src: string, alias: string }}
 */
export function parseDemosArgs(src, options) {
  if (typeof src !== 'string' || src.length === 0) {
    throw new Error(
      `demos() requires a path to the demos as its first argument, e.g. ` +
        `demos(import.meta.resolve('./demos'), { as: '#demos/foo' })`
    );
  }

  const alias = options?.as;

  if (typeof alias !== 'string' || alias.length === 0) {
    throw new Error(
      `demos() requires an \`as\` option — the specifier the demos are imported under, e.g. ` +
        `demos(import.meta.resolve('./demos'), { as: '#demos/foo' }) enables ` +
        `\`import ... from '#demos/foo/<demo>'\``
    );
  }

  const isValidImportUri =
    !/\s/.test(alias) && !alias.startsWith('.') && !alias.startsWith('/') && !alias.endsWith('/');

  if (!isValidImportUri) {
    throw new Error(
      `demos()'s \`as\` is used verbatim as an import specifier, so it must be a valid ` +
        `import URI: no whitespace, not relative, not starting or ending with '/'. ` +
        `Received: '${alias}'. Try something like '#demos/foo'.`
    );
  }

  const normalized = normalizePath(src);

  if (!existsSync(normalized)) {
    throw new Error(`demos()'s path does not exist: '${normalized}' (from '${src}')`);
  }

  return { src: normalized, alias };
}

/**
 * Every specifier a demos() source provides, mapped to the file it
 * resolves to:
 *
 * - each file, without its extension: `<as>/<file>`
 * - an index file also provides its directory:
 *   `<as>` (root), `<as>/<dir>` (nested)
 *
 * @param {string} alias
 * @param {string} src - absolute path to the demos
 * @param {string[]} entries - files, relative to src
 * @returns {Record<string, string>} specifier → absolute file path
 */
export function demoSpecifiers(alias, src, entries) {
  const specifiers = {};

  for (const entry of entries.toSorted()) {
    const file = join(src, entry);
    const base = entry.replace(EXTENSION_PATTERN, '');

    specifiers[`${alias}/${base}`] = file;

    if (base === 'index') {
      specifiers[alias] = file;
    } else if (base.endsWith('/index')) {
      specifiers[`${alias}/${base.slice(0, -'/index'.length)}`] = file;
    }
  }

  return specifiers;
}

async function enumerate(src) {
  const entries = [];

  for await (const entry of glob(`**/*.{${DEMO_EXTENSIONS.join(',')}}`, {
    cwd: src,
    exclude: ['node_modules'],
  })) {
    entries.push(entry);
  }

  return entries;
}

/**
 * All aliases contributed by every demos() usage in the config,
 * in plugin order.
 */
function allUsages(state) {
  return state.usages;
}

const RUNTIME_MAP_ID = 'kolay/demos:virtual';
const RESOLVED_RUNTIME_MAP_ID = '\0kolay/demos:virtual';

/**
 * The demos plugin: aliases a directory of demo components so code
 * fences can import them —
 *
 * ```js
 * // vite.config.js
 * demos(import.meta.resolve('./demos'), { as: '#demos/foo' });
 * ```
 *
 * ```js
 * // any live codefence, .md or .gjs.md
 * import Example from '#demos/foo/example';
 * ```
 *
 * The runtime compiler learns these automatically ('kolay/demos:virtual'
 * feeds `setupKolay`), so `.md` fences need no `modules` configuration.
 *
 * @type {(state: { options: { src: string, alias: string }, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions}
 */
export const demos = (state) => {
  const name = 'kolay:demos';

  /** @type {Record<string, string>} */
  let specifiers = {};

  return {
    name,
    // '#'-style specifiers otherwise hit the bundler's native
    // subpath-imports resolution (package.json#imports) first, which
    // errors hard on unknown specifiers
    enforce: 'pre',

    resolveId(id) {
      // the shared runtime map, served by the primary usage
      if (id === RUNTIME_MAP_ID && state.isPrimary) {
        return { id: RESOLVED_RUNTIME_MAP_ID };
      }

      const prefix = state.options.alias;

      if (id !== prefix && !id.startsWith(`${prefix}/`)) return;

      const file = specifiers[id];

      if (file) return file;

      throw new Error(
        `'${id}' does not exist in the demos() source '${state.options.src}'. ` +
          `Available: ${Object.keys(specifiers).join(', ') || '(no demos found)'}`
      );
    },

    loadInclude(id) {
      return id === RESOLVED_RUNTIME_MAP_ID && state.isPrimary;
    },

    async load(id) {
      if (id !== RESOLVED_RUNTIME_MAP_ID || !state.isPrimary) return;

      const maps = await Promise.all(
        allUsages(state).map(async (usage) =>
          demoSpecifiers(usage.alias, usage.src, await enumerate(usage.src))
        )
      );

      const merged = Object.assign({}, ...maps);

      return stripIndent`
        export const modules = {
          ${Object.entries(merged)
            .map(
              ([specifier, file]) =>
                `${JSON.stringify(specifier)}: () => import(${JSON.stringify('/@fs' + file)})`
            )
            .join(',\n')}
        };
      `;
    },

    vite: {
      api: { kolay: state },
      async configResolved(resolvedConfig) {
        /**
         * Discover every demos() usage — each aliases its own directory,
         * the first ("primary") usage serves the shared runtime map.
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

          const aliases = usages.map((usage) => usage.alias);
          const duplicates = aliases.filter((alias, i) => aliases.indexOf(alias) !== i);

          if (duplicates.length > 0) {
            throw new Error(
              `Every demos() usage needs its own \`as\`. Duplicated: ${[...new Set(duplicates)].join(', ')}`
            );
          }
        }

        resolvedConfig.server ||= {};
        resolvedConfig.server.fs ||= {};
        resolvedConfig.server.fs.allow ||= [];
        resolvedConfig.server.fs.allow.push(state.options.src);

        specifiers = demoSpecifiers(
          state.options.alias,
          state.options.src,
          await enumerate(state.options.src)
        );
      },
    },
  };
};
