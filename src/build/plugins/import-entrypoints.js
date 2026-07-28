import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { stripIndent } from 'common-tags';

import { normalizePath } from './utils.js';

/**
 * Whether an exports value leads to something importable at runtime —
 * a target other than type declarations. Values may be strings,
 * condition objects, fallback arrays, or null (blocked).
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isImportable(value) {
  if (typeof value === 'string') {
    return !value.endsWith('.d.ts') && !value.endsWith('.d.mts') && !value.endsWith('.d.cts');
  }

  if (Array.isArray(value)) {
    return value.some(isImportable);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).some(
      ([condition, target]) => condition !== 'types' && isImportable(target)
    );
  }

  return false;
}

/**
 * Entries that exist for tooling, not for importing.
 */
const CONVENTIONAL_SKIPS = ['./package.json', './addon-main.js', './addon-main.cjs'];

/**
 * Whether an exclude pattern matches a subpath key.
 * Patterns are exact keys, or prefixes ending in '*'.
 */
function isExcluded(key, exclude) {
  return exclude.some((pattern) =>
    pattern.endsWith('*') ? key.startsWith(pattern.slice(0, -1)) : key === pattern
  );
}

/**
 * The import specifiers a package's `exports` provides:
 *
 * - `.` → the package name; `./components` → `<name>/components`
 * - wildcard keys (`./*`) are skipped — they cannot be enumerated from
 *   the keys alone
 * - types-only entries, blocked (null) entries, `./package.json`, and
 *   the addon-main tooling entries are skipped
 * - a package without `exports` provides just its name
 *
 * @param {string} name - the package's name
 * @param {unknown} exports - the package.json#exports value
 * @param {{ exclude?: string[] }} [options]
 * @returns {string[]}
 */
export function entrypointsFromExports(name, exports, options = {}) {
  const exclude = options.exclude ?? [];

  if (!exports) {
    return isExcluded('.', exclude) ? [] : [name];
  }

  /** @type {Record<string, unknown>} */
  let subpaths;

  if (typeof exports === 'string') {
    subpaths = { '.': exports };
  } else if (Object.keys(exports).every((key) => !key.startsWith('.'))) {
    // a bare conditions object is the '.' entry's conditions
    subpaths = { '.': exports };
  } else {
    subpaths = /** @type {Record<string, unknown>} */ (exports);
  }

  const specifiers = [];

  for (const [key, value] of Object.entries(subpaths)) {
    if (key.includes('*')) continue;
    if (CONVENTIONAL_SKIPS.includes(key)) continue;
    if (isExcluded(key, exclude)) continue;
    if (!isImportable(value)) continue;

    specifiers.push(key === '.' ? name : `${name}/${key.slice(2)}`);
  }

  return specifiers.toSorted();
}

/**
 * Locates the package.json for the given input: a package name
 * (resolved from cwd, like the bundler will) or a path to a directory
 * containing a package.json.
 *
 * @param {string} input
 * @param {string} cwd
 * @returns {{ name: string, exports: unknown }}
 */
export function resolvePackageJson(input, cwd) {
  const isPathish =
    input.startsWith('file:') || input.startsWith('.') || input.startsWith('/') || /\\/.test(input);

  let packagePath;

  if (isPathish) {
    packagePath = join(normalizePath(input), 'package.json');

    if (!existsSync(packagePath)) {
      throw new Error(
        `importEntrypoints() could not find a package.json in '${normalizePath(input)}' (from '${input}')`
      );
    }
  } else {
    const require = createRequire(join(cwd, 'package.json'));

    // `exports` almost never exposes package.json itself, so resolve
    // through the node_modules candidate directories instead.
    const candidates = require.resolve.paths(input) ?? [];
    const found = candidates
      .map((dir) => join(dir, input, 'package.json'))
      .find((candidate) => existsSync(candidate));

    if (!found) {
      throw new Error(
        `importEntrypoints() could not resolve the package '${input}' from ${cwd}. Is it installed?`
      );
    }

    packagePath = found;
  }

  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

  if (!packageJson.name) {
    throw new Error(`The package.json at '${dirname(packagePath)}' has no name`);
  }

  return { name: packageJson.name, exports: packageJson.exports };
}

/**
 * importEntrypoints() takes (packageNameOrPath, options?):
 *
 * - `importEntrypoints('ember-primitives')`
 * - `importEntrypoints('./packages/my-lib')` — a directory containing
 *   a package.json
 * - `importEntrypoints('kolay', { exclude: ['./vite', './build*'] })`
 *
 * @param {string} input
 * @param {{ exclude?: string[] }} [options]
 * @returns {{ input: string, entrypoints: string[] }}
 */
export function parseImportEntrypointsArgs(input, options) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error(
      `importEntrypoints() requires a package name (or a path to a directory containing ` +
        `a package.json) as its first argument, e.g. importEntrypoints('ember-primitives')`
    );
  }

  const exclude = options?.exclude;

  if (exclude !== undefined) {
    const isValid =
      Array.isArray(exclude) && exclude.every((entry) => typeof entry === 'string' && entry);

    if (!isValid) {
      throw new Error(
        `importEntrypoints()'s \`exclude\` must be an array of subpath keys ` +
          `(exact, or ending in '*'), e.g. { exclude: ['./vite', './build*'] }`
      );
    }
  }

  const { name, exports } = resolvePackageJson(input, process.cwd());

  return { input, entrypoints: entrypointsFromExports(name, exports, { exclude }) };
}

const RUNTIME_MAP_ID = 'kolay/import-entrypoints:virtual';
const RESOLVED_RUNTIME_MAP_ID = '\0kolay/import-entrypoints:virtual';

/**
 * The import-entrypoints plugin: enumerates a package's
 * package.json#exports and teaches the runtime compiler every
 * entrypoint, so `.md` fences can import the package with no
 * `modules` configuration —
 *
 * ```js
 * // vite.config.js
 * importEntrypoints('ember-primitives');
 * ```
 *
 * ```js
 * // any .md live codefence
 * import { ExternalLink } from 'ember-primitives';
 * ```
 *
 * ('kolay/import-entrypoints:virtual' feeds the generated `setupKolay`.)
 *
 * @type {(state: { options: { input: string, entrypoints: string[] }, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions}
 */
export const importEntrypoints = (state) => {
  const name = 'kolay:import-entrypoints';

  return {
    name,

    resolveId(id) {
      // the shared runtime map, served by the primary usage
      if (id === RUNTIME_MAP_ID && state.isPrimary) {
        return { id: RESOLVED_RUNTIME_MAP_ID };
      }

      return;
    },

    loadInclude(id) {
      return id === RESOLVED_RUNTIME_MAP_ID && state.isPrimary;
    },

    load(id) {
      if (id !== RESOLVED_RUNTIME_MAP_ID || !state.isPrimary) return;

      const merged = [...new Set(state.usages.flatMap((usage) => usage.entrypoints))].toSorted();

      return stripIndent`
        export const modules = {
          ${merged
            .map(
              (specifier) =>
                `${JSON.stringify(specifier)}: () => import(${JSON.stringify(specifier)})`
            )
            .join(',\n')}
        };
      `;
    },

    vite: {
      api: { kolay: state },
      configResolved(resolvedConfig) {
        /**
         * Discover every importEntrypoints() usage — each contributes
         * its package's entrypoints, the first ("primary") usage serves
         * the shared runtime map.
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
    },
  };
};
