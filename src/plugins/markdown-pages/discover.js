import { reshape } from './hydrate.js';

/**
 * @typedef {object} Options
 * @property {string | undefined} [ include ]
 * @property {string[] | undefined} [ exclude ]
 * @property {string} cwd
 * @property {boolean | undefined} [ onlyDirectories ]
 *
 * @param {Options} options
 */
export async function discover({ include, onlyDirectories, exclude, cwd }) {
  include ??= '**/*';
  exclude ??= [];
  onlyDirectories ??= false;

  const { globbySync } = await import('globby');

  let paths = globbySync(include, {
    cwd,
    expandDirectories: true,
    onlyDirectories,
  });

  // Needs to be const, because TS thinks exclude can change while `filter` is running.
  const excludePattern = exclude;

  paths = paths.filter((path) => !excludePattern.some((pattern) => path.match(pattern)));

  const reshaped = await reshape(paths, cwd);

  return reshaped;
}
