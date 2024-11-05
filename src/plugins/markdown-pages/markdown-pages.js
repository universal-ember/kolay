import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { stripIndent } from 'common-tags';
import { globbySync } from 'globby';
import send from 'send';

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

  /**
   * @type {import('vite').ViteDevServer}
   */
  let server;
  let baseUrl = '/';

  return {
    name: 'kolay:markdown-docs',
    vite: {
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.jsonc')) {
          server.ws.send({
            type: 'full-reload',
            path: '*',
          });
        }
      },
      configResolved(resolvedConfig) {
        baseUrl = resolvedConfig.base;
      },
      configureServer(s) {
        server = s;

        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (req.originalUrl && req.originalUrl.length > 1) {
              const assetUrl = req.originalUrl.split('?')[0] || '';

              if (assetUrl === `${baseUrl}${destination}/${name}`) {
                const reshaped = await discover({ src, groups, baseUrl });

                res.setHeader('content-type', 'application/json');

                return res.end(JSON.stringify(reshaped, null, 2));
              }

              if (groups && assetUrl.slice(baseUrl.length - 1).startsWith('/docs')) {
                const groupName = assetUrl.slice(baseUrl.length - 1).split('/')[2];
                const g = groups.find((group) => {
                  // discover mutates the groups array
                  if (group.name === 'root') return;

                  return group.name === groupName;
                });

                if (g) {
                  const filePath = resolve(g.src, assetUrl.split('/').slice(3).join('/'));

                  return send(req, filePath).pipe(res);
                }
              }
            }

            return next();
          });
        };
      },
    },
    async buildStart() {
      assert(
        src && !relative(process.cwd(), src).startsWith('../'),
        `When using \`src\` as a top-level option to \`markdownPages\`, ` +
          `it must be held within the current directory. ` +
          `The current directory is ${process.cwd()}, and with a \`src\` of ${src}, ` +
          `we exit the project. If you want to include files from outside the project, ` +
          `use the 'groups' key.`
      );

      if (server) return;

      const reshaped = await discover({ src, groups, baseUrl });

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
            let request = await fetch('${baseUrl || '/'}${fileName}', {
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
