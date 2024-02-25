import assert from 'node:assert';
import { join } from 'node:path';

import { stripIndent } from 'common-tags';
import { createUnplugin } from 'unplugin';

import { virtualFile } from '../helpers.js';
import { discover } from './discover.js';

const SECRET_INTERNAL_IMPORT = 'kolay/manifest:virtual';

export const markdownPages = createUnplugin(
  /**
   * @param {import('./types.ts').CreateManifestOptions} [ options ]
   */
  (options) => {
    let { src, dest, name, include, exclude, onlyDirectories } = options ?? {};

    const destination = dest ?? 'kolay-manifest';

    assert(
      src,
      `A src directory must be specified for the core documentation. This may be an empty folder, but it usally is the "root-est" information on your docs site`
    );

    assert(
      destination,
      `A destination directory could not be determined. Please specify either 'src' or 'dest' in the options for createManifest`
    );

    name ??= 'manifest.json';

    const fileName = join(destination, name);

    return {
      name: 'kolay:markdown-docs',
      async buildStart() {
        const cwd = src ? join(process.cwd(), src) : process.cwd();
        const reshaped = await discover({ cwd, onlyDirectories, exclude, include });

        // TODO: if reshaped contains outside of `./**`, we need to emitFile them to a matching location

        // The *Manifest*
        //   Includes a list and tree structure of all discovered docs
        this.emitFile({
          type: 'asset',
          fileName,
          source: JSON.stringify(reshaped),
        });
      },

      ...virtualFile({
        importPath: SECRET_INTERNAL_IMPORT,
        content: stripIndent`
          export const load = async () => {
            let request = await fetch('/${fileName}', {
              headers: {
                Accept: 'application/json',
              },
            });
            let json = await request.json();
            return json;
          }
        `,
      }),
    };
  }
);
