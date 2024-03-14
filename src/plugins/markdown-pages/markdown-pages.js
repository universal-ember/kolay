import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { stripIndent } from 'common-tags';
import { globbySync } from 'globby';

import { virtualFile } from '../helpers.js';
import { discover } from './discover.js';

const SECRET_INTERNAL_IMPORT = 'kolay/manifest:virtual';

/** @type {(options: import('./types.ts').MarkdownPagesOptions) => import('unplugin').UnpluginOptions} */
export const markdownPages = (options) => {
  let { src, dest, name, groups } = options ?? {};

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
  groups ??= [];

  const fileName = join(destination, name);

  return {
    name: 'kolay:markdown-docs',
    async buildStart() {
      assert(
        src && !relative(process.cwd(), src).startsWith('../'),
        `When using \`src\` as a top-level option to \`markdownPages\`, ` +
          `it must be held within the current directory. ` +
          `The current directory is ${process.cwd()}, and with a \`src\` of ${src}, ` +
          `we exit the project. If you want to include files from outside the project, ` +
          `use the 'groups' key.`
      );

      const reshaped = await discover({ src, groups });

      if (groups) {
        groups.forEach((group) => {
          // discover mutates the groups array
          if (group.name === 'root') return;

          /**
           * We can support pulling docs out of node_modules,
           * but going deeply through node_modules would be bonkers.
           */
          const paths = globbySync('**/*.{md,json,jsonc}', {
            cwd: group.src,
            expandDirectories: true,
            ignore: ['**/node_modules/**'],
          });

          paths.forEach((p) => {
            const fileName = join(group.src, p);
            const fullPath = resolve(fileName);

            this.addWatchFile(fullPath);
            this.emitFile({
              type: 'asset',
              fileName: join('docs', group.name, p),
              source: readFileSync(fullPath).toString(),
            });
          });
        });
      }

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
};
