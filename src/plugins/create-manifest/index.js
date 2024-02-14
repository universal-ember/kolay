import assert from 'node:assert';

import { createUnplugin } from 'unplugin';

import { reshape } from './hydrate.js';

/**
 *
 */
export const createManifest = createUnplugin(
  /**
   * @param {import('./types.ts').CreateManifestOptions} [ options ]
   */
  (options) => {
    let { src, dest, name, include, exclude, onlyDirectories } = options ?? {};

    const destination = dest ?? 'docs';

    assert(
      destination,
      `A destination directory could not be determined. Please specify either 'src' or 'dest' in the options for createManifest`
    );

    return {
      name: 'create-manifest',
      async buildStart() {
        name ??= 'manifest.json';
        include ??= '**/*';
        exclude ??= [];
        onlyDirectories ??= false;

        const path = await import('node:path');
        const { globbySync } = await import('globby');

        const cwd = src ? path.join(process.cwd(), src) : process.cwd();
        let paths = globbySync(include, {
          cwd,
          expandDirectories: true,
          onlyDirectories,
        });

        // Needs to be const, because TS thinks exclude can change while `filter` is running.
        const excludePattern = exclude;

        paths = paths.filter((path) => !excludePattern.some((pattern) => path.match(pattern)));

        const reshaped = await reshape(paths, cwd);

        this.emitFile({
          type: 'asset',
          fileName: path.join(destination, name),
          source: JSON.stringify(reshaped),
        });
      },
    };
  }
);
