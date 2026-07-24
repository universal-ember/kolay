import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join, resolve } from 'node:path';

function describe(value) {
  if (typeof value === 'string') return `"${value}"`;

  try {
    return `${JSON.stringify(value)} (${typeof value})`;
  } catch {
    return typeof value;
  }
}

/**
 * Whether the package can actually be found in the install environment.
 * (package.json can't be trusted for this: the install may be broken,
 *  or may simply not have been run)
 *
 * @param {string} entry
 * @param {string} cwd
 */
function packageExists(entry, cwd) {
  const require = createRequire(join(cwd, 'package.json'));

  try {
    require.resolve(entry);

    return true;
  } catch (error) {
    // These mean the package IS installed — it just doesn't expose an
    // importable '.' entry (types-only packages, strict `exports`, etc).
    // Whether usable typedoc entry points exist is determined later,
    // during generation.
    if (error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') return true;
    if (error?.code === 'ERR_UNSUPPORTED_DIR_IMPORT') return true;

    return false;
  }
}

/**
 * typedoc() receives a string, or an array of strings, where each entry
 * is either
 * - a package name, which must be resolvable from the consuming project
 *   (i.e.: actually installed) — paths within packages are not allowed,
 *   because type entry points are discovered from the package's
 *   package.json#exports — or
 * - a relative path, which must exist on disk.
 *
 * Every entry is checked, and all problems are reported in one error.
 *
 * @param {unknown} input
 * @param {string} cwd
 * @return {string[]} the validated entries, normalized to an array
 */
export function validatePackages(input, cwd) {
  const packages = typeof input === 'string' ? [input] : input;

  if (!Array.isArray(packages)) {
    throw new Error(
      `typedoc() expects a package name or relative path, or an array of them, ` +
        `e.g.: typedoc(['my-library', './packages/my-library']). ` +
        `Received: ${describe(input)}`
    );
  }

  const problems = [];

  for (const entry of packages) {
    if (typeof entry !== 'string') {
      problems.push(`${describe(entry)}: every entry must be a string`);
      continue;
    }

    if (isAbsolute(entry)) {
      problems.push(
        `"${entry}": absolute paths are not supported, because they are not ` +
          `portable between environments — use a package name or a path relative to ${cwd}`
      );
      continue;
    }

    if (entry.startsWith('.')) {
      const path = resolve(cwd, entry);

      if (!existsSync(path)) {
        problems.push(`"${entry}": does not exist (resolved to ${path})`);
      }

      continue;
    }

    const segments = entry.split('/');
    const packageSegments = entry.startsWith('@') ? 2 : 1;

    if (segments.length > packageSegments) {
      const packageRoot = segments.slice(0, packageSegments).join('/');

      problems.push(
        `"${entry}": paths within packages are not supported — type entry points ` +
          `are discovered from the package's package.json#exports. Use "${packageRoot}" instead.`
      );
      continue;
    }

    if (!packageExists(entry, cwd)) {
      problems.push(
        `"${entry}": could not be resolved from ${cwd}. ` +
          `Is it declared in your package.json, and have you run your ` +
          `package manager's install? (pnpm install / npm install / yarn install)`
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `typedoc() received invalid entries:\n` +
        problems.map((problem) => `  - ${problem}`).join('\n')
    );
  }

  return packages;
}
