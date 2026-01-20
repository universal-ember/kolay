import { reshape } from './hydrate.js';

const DEFAULT_GROUP = {
  name: 'Home',
  static: './{app,src}/templates/**/*.gjs.md',
};

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
 * @return {Promise<import('../../../types.ts').Manifest>}
 */
export async function discover({ groups, src, cwd }) {
  groups ??= [];

  const groupsToLookFor = new Set();

  const home = groups.find((group) => group.name === 'Home') ?? DEFAULT_GROUP;

  groupsToLookFor.add(home);

  if (src) {
    groupsToLookFor.add({ name: 'root', src });
  }

  groups.map((group) => groupsToLookFor.add(group));

  const foundGroups = await Promise.all(
    [...groupsToLookFor.values()].map(async (group) => {
      const { static: staticInclude, include, onlyDirectories, exclude } = group;
      const prefix = group.name === 'root' ? '' : group.name === 'Home' ? '' : `/${group.name}`;

      const found = await pathsFor({
        include: staticInclude ?? include ?? '**/*.md',
        onlyDirectories: onlyDirectories ?? false,
        exclude: exclude ?? [],
        cwd: group.src ?? cwd,
        prefix,
      });

      return {
        name: group.name,
        type: staticInclude ? 'static' : 'runtime',
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
 * @property {string} [ prefix ]
 *
 * @param {PathsForOptions} options
 */
async function pathsFor({ include, onlyDirectories, exclude, cwd, prefix }) {
  const { globbySync } = await import('globby');

  let paths = globbySync(include, {
    cwd,
    ignore: ['**/node_modules/**'],
    expandDirectories: true,
    onlyDirectories,
  });

  // Needs to be const, because TS thinks exclude can change while `filter` is running.
  const excludePattern = exclude;

  paths = paths.filter((path) => !excludePattern.some((pattern) => path.match(pattern)));

  const reshaped = await reshape({
    cwd,
    paths,
    prefix,
  });

  return reshaped;
}
