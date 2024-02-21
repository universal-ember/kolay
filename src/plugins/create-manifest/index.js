import assert from 'node:assert';

import { createUnplugin } from 'unplugin';

import { discover } from './discover.js';

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

        const path = await import('node:path');
        const cwd = src ? path.join(process.cwd(), src) : process.cwd();
        const reshaped = await discover({ cwd, onlyDirectories, exclude, include });

        this.emitFile({
          type: 'asset',
          fileName: path.join(destination, name),
          source: JSON.stringify(reshaped),
        });
      },
    };
  }
);
