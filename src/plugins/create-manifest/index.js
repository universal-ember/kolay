import { createUnplugin } from 'unplugin';

import { parse } from './parse.js';

/**
 *
 */
export const createManifest = createUnplugin((options) => {
  let { src, dest, name, include, exclude, onlyDirectories } = options ?? {};

  dest ??= src;
  name ??= 'manifest.json';
  include ??= '**/*';
  exclude ??= [];
  onlyDirectories ??= false;

  return {
    name: 'create-manifest',
    async buildStart() {
      const path = await import('node:path');
      const { globbySync } = await import('globby');

      const cwd = path.join(process.cwd(), src);
      let paths = globbySync(include, {
        cwd,
        expandDirectories: true,
        onlyDirectories,
      });

      paths = paths.filter((path) => !exclude.some((pattern) => path.match(pattern)));

      const reshaped = await reshape(paths, cwd);

      await this.emitFile({
        type: 'asset',
        fileName: path.join(dest, name),
        source: JSON.stringify(reshaped),
      });
    },
    // watchChange(id) {
    //   console.debug('watchChange', id);
    // },
  };
});

/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 */
async function reshape(paths, cwd) {
  let grouped = await parse(paths, cwd);

  let entries = Object.entries(grouped);
  let first = entries[0];
  let firstTutorial = grouped[first[0]][0];

  let list = entries.map(([, tutorials]) => tutorials);

  return {
    first: firstTutorial,
    list,
    grouped,
  };
}
