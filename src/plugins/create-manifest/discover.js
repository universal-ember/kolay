import { reshape } from './hydrate.js';

/**
 * @typedef {object} Options
 * @property {string} include
 * @property {string[]} exclude
 * @property {string} cwd
 * @property {boolean} onlyDirectories
 *
 * @param {Options} options
 */
export async function discover({ include, onlyDirectories, exclude, cwd }) {
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
