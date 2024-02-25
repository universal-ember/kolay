import { reshape } from './hydrate.js';

/**
 * @typedef {object} Group
 * @property {string} name
 * @property {string} src
 * @property {string | undefined} [ include ]
 * @property {string[] | undefined} [ exclude ]
 * @property {boolean | undefined} [ onlyDirectories ]
 *
 * @typedef {object} Options
 * @property {string | undefined} [ src ]
 * @property {Group[] | undefined} [ groups ]
 *
 * @param {Options} options
 * @return {Promise<import('./types.ts').Manifest>}
 */
export async function discover({ groups, src }) {
  groups ??= [];

  if (src) {
    groups.unshift({ name: 'root', src });
  }

  let foundGroups = await Promise.all(
    groups.map(async (group) => {
      let { include, onlyDirectories, exclude } = group;

      const found = await pathsFor({
        include: include ?? '**/*',
        onlyDirectories: onlyDirectories ?? false,
        exclude: exclude ?? [],
        cwd: group.src,
      });

      return {
        name: group.name,
        ...found,
      };
    })
  );

  return {
    groups: foundGroups,
  };
}

/**
 * @typedef {object} PathsForOptions
 * @property {string} include
 * @property {string[] } exclude
 * @property {string} cwd
 * @property {boolean} onlyDirectories
 *
 * @param {PathsForOptions} options
 */
async function pathsFor({ include, onlyDirectories, exclude, cwd }) {
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
