import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

function describe(value) {
  if (typeof value === 'string') return `"${value}"`;

  try {
    return `${JSON.stringify(value)} (${typeof value})`;
  } catch {
    return typeof value;
  }
}

function declaredDependencies(cwd) {
  const manifestPath = join(cwd, 'package.json');

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    return new Set(
      [
        manifest.name,
        ...Object.keys(manifest.dependencies ?? {}),
        ...Object.keys(manifest.devDependencies ?? {}),
        ...Object.keys(manifest.peerDependencies ?? {}),
      ].filter(Boolean)
    );
  } catch {
    return new Set();
  }
}

/**
 * typedoc() receives an array of strings, where each entry is either
 * - a package name, which must be declared in the consuming project's
 *   package.json (dependencies, devDependencies, or peerDependencies), or
 * - a relative path, which must exist on disk.
 *
 * Every entry is checked, and all problems are reported in one error.
 *
 * @param {unknown} packages
 * @param {string} cwd
 */
export function validatePackages(packages, cwd) {
  if (!Array.isArray(packages)) {
    throw new Error(
      `typedoc() expects an array of package names and/or relative paths, ` +
        `e.g.: typedoc(['my-library', './packages/my-library']). ` +
        `Received: ${describe(packages)}`
    );
  }

  const problems = [];
  const declared = declaredDependencies(cwd);

  for (const entry of packages) {
    if (typeof entry !== 'string') {
      problems.push(`${describe(entry)}: every entry must be a string`);
      continue;
    }

    if (isAbsolute(entry)) {
      problems.push(
        `"${entry}": absolute paths are not supported — ` +
          `use a package name or a path relative to ${cwd}`
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

    if (!declared.has(entry)) {
      problems.push(
        `"${entry}": not listed in ${join(cwd, 'package.json')} ` +
          `(dependencies, devDependencies, or peerDependencies)`
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `typedoc() received invalid entries:\n` +
        problems.map((problem) => `  - ${problem}`).join('\n')
    );
  }
}
