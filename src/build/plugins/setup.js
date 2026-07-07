/**
 * This plugin is *basically* what v1 addons did.
 */
import { existsSync } from 'node:fs';
import { glob, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripIndent } from 'common-tags';
import send from 'send';

import { virtualFile } from './helpers.js';
import { reshape } from './markdown-pages/hydrate.js';
import { readJSONC } from './markdown-pages/parse.js';

function normalizePath(path) {
  if (path.startsWith('file:/')) {
    return fileURLToPath(path);
  }

  return path;
}

const ASSET_GLOB = '**/*.{svg,png,jpg,jpeg,gif,webp,avif}';
const ASSET_EXT = /\.(svg|png|jpe?g|gif|webp|avif)$/i;

/**
 * Directories whose non-markdown assets are served/emitted at their
 * manifest-space URLs (`<base><groupName>/<relative path>`). The unnamed
 * entries are the co-located pages roots, whose page URLs drop that prefix.
 */
function assetRoots(options, cwd) {
  return [
    { name: '', dir: join(cwd, 'app', 'templates') },
    { name: '', dir: join(cwd, 'src', 'templates') },
    ...(options?.groups ?? []).map((group) => ({
      name: group.name,
      dir: normalizePath(group.src),
    })),
  ];
}

/** @type {() => import('unplugin').UnpluginOptions} */
export const setup = (options = {}) => {
  const cwd = process.cwd();
  let baseUrl = '/';
  let isBuild = false;

  return {
    name: 'kolay:setup',
    vite: {
      configResolved(resolvedConfig) {
        baseUrl = resolvedConfig.base;
        isBuild = resolvedConfig.command === 'build';

        resolvedConfig.server ||= {};
        resolvedConfig.server.fs ||= {};
        resolvedConfig.server.fs.allow ||= [];

        options.groups.forEach((group) => {
          resolvedConfig.server.fs.allow.push(normalizePath(group.src));
        });
      },
      /**
       * Serve co-located doc assets at their manifest-space URLs in dev.
       * Registered directly (not via a returned function) so it runs before
       * vite's internal static-file middleware.
       */
      configureServer(server) {
        const roots = assetRoots(options, cwd);

        server.middlewares.use((req, res, next) => {
          const [urlPath = ''] = (req.url ?? '').split('?');

          if (!ASSET_EXT.test(urlPath)) return next();

          for (const { name, dir } of roots) {
            const prefix = baseUrl + (name ? name + '/' : '');

            if (!urlPath.startsWith(prefix)) continue;

            const rel = urlPath.slice(prefix.length);
            const candidate = join(dir, decodeURIComponent(rel));

            // Path-traversal guard, and fall through to the other roots when
            // this one doesn't have the file — the unnamed templates roots
            // match every URL under the base.
            if (relative(dir, candidate).startsWith('..')) continue;
            if (!existsSync(candidate)) continue;

            send(req, rel, { root: dir })
              .on('error', () => next())
              .pipe(res);

            return;
          }

          next();
        });
      },
      /**
       * Emit co-located doc assets into dist at their manifest-space paths
       * (`<groupName>/<relative path>`, no base prefix — fileName is
       * dist-relative) so production serves them at the same URLs dev does.
       */
      async buildStart() {
        if (!isBuild) return;

        for (const { name, dir } of assetRoots(options, cwd)) {
          try {
            for await (const entry of glob(ASSET_GLOB, { cwd: dir, exclude: ['node_modules'] })) {
              const posixEntry = entry.replaceAll('\\', '/');

              this.emitFile({
                type: 'asset',
                fileName: name ? `${name}/${posixEntry}` : posixEntry,
                source: await readFile(join(dir, entry)),
              });
            }
          } catch {
            // root directory doesn't exist (e.g. no src/templates) — nothing to emit
          }
        }
      },
    },
    ...virtualFile([
      {
        importPath: 'kolay/setup',
        content: stripIndent`
          import { getOwner, setOwner } from '@ember/owner';
          import { assert } from '@ember/debug';
          import { docsManager } from 'kolay';
          import { registerDestructor } from '@ember/destroyable';


          const secret = window[Symbol.for('__kolay__secret__context__')] ||= {};
          secret.owners ||= new Set();

          export async function setupKolay(context, options) {
            let owner = getOwner(context) ?? context.owner;

            // This is needed because some of our components can be rendered with different owners.
            // But the fetching of API docs is unique per window, not per owner -- documents at an URL
            // can't change.
            secret.owners.add(owner);

            registerDestructor(owner, () => secret.owners.delete(owner));

            assert(
              \`Expected owner to exist on the passed context, \`
              + \`the first parameter passed to setup, but it did not. \`
              + \`Please make sure you pass a framework object as the first paramter to setup, \`
              + \`or make sure that the context that is passed has, at some point, \`
              + \`had setOwner called on it\`,
              owner
            );

            let docs = docsManager(owner);

            // NOTE: TS doesn't resolve paths with colons in them.
            //       But these files don't actually exist on disk.
            //       They are provided by two plugins,
            //       - apiDocs
            //       - markdownPages
            //
            //       If you find yourself reading this comment,
            //       be sure to have both plugins setup in your plugins array.
            //
            //       NOTE: we can't have a virtual module import
            //             more virtual modules under embroide.
            //             :(
            //             So the whole strategy / benefit of setupKolay is
            //             .... much less useful than originally planned
            let [apiDocs, compiledDocs] = await Promise.all([
              import('kolay/api-docs:virtual'),
              import('kolay/compiled-docs:virtual'),
            ]);

            await docs.setup({
              apiDocs,
              compiledDocs,
              ...options,
            });


            return docs.manifest;
          }
        `,
      },
      {
        importPath: 'kolay/compiled-docs:virtual',
        content: async () => {
          const result = {};
          const globs = [
            {
              name: '',
              path: './',
              cwd,
              glob: glob('./{app,src}/templates/**/*.{md,gjs.md,gts.md,json,jsonc}', {
                cwd,
                exclude: ['node_modules'],
              }),
            },
          ];

          /**
           * TODO: support `onlyDirectories` of what globby provides
           */
          for (const group of options?.groups ?? []) {
            const path = relative(cwd, group.src);

            globs.push({
              name: group.name,
              path,
              cwd: normalizePath(group.src),
              glob: glob('**/*.{md,gjs.md,gts.md,json,jsonc}', {
                cwd: normalizePath(group.src),
                exclude: ['node_modules'],
              }),
            });
          }

          const manifest = {
            groups: [],
          };

          function removeUnwantedPrexix(path) {
            return path.replace(/^(app|src)\/templates\//, '');
          }

          for (const config of globs) {
            const paths = [];
            const configs = [];

            for await (const entry of config.glob) {
              if (entry.endsWith('.json') || entry.endsWith('.jsonc')) {
                const configPath = join(config.cwd, entry);

                configs.push({
                  path: removeUnwantedPrexix(entry),
                  config: await readJSONC(configPath),
                  cwd: config.cwd,
                });
                continue;
              }

              const name =
                baseUrl +
                (config.name ? config.name + '/' : '') +
                removeUnwantedPrexix(entry).replace(/\.(gjs|gts)\.md$/, '');
              const full = '/@fs' + join(normalizePath(config.cwd), entry);

              let query = '';

              if (entry.endsWith('.md')) {
                if (!entry.endsWith('.gjs.md') && !entry.endsWith('.gts.md')) {
                  query = '?raw';
                }
              }

              result[name] = `() => import("${full}${query}")`;
              paths.push(removeUnwantedPrexix(entry));
            }

            const found = await reshape({
              cwd: config.cwd,
              paths,
              configs,
              prefix: join(baseUrl, config.name),
            });

            manifest.groups.push({
              name: config.name || 'Home',
              ...found,
            });
          }

          const virtualFile = stripIndent`
            export const manifest = ${JSON.stringify(manifest)};

            export const pages = {
              ${Object.entries(result)
                .map(([name, importer]) => `"${name}": ${importer}`)
                .join(',\n')}
            };
          `;

          return virtualFile;
        },
      },
    ]),
  };
};
