/**
 * This plugin is *basically* what v1 addons did.
 */
import { glob } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripIndent } from 'common-tags';

import { virtualFile } from './helpers.js';
import { reshape } from './markdown-pages/hydrate.js';

function normalizePath(path) {
  if (path.startsWith('file:/')) {
    return fileURLToPath(path);
  }

  return path;
}

/** @type {() => import('unplugin').UnpluginOptions} */
export const setup = (options = {}) => {
  const cwd = process.cwd();
  let baseUrl = '/';

  return {
    name: 'kolay:setup',
    vite: {
      configResolved(resolvedConfig) {
        baseUrl = resolvedConfig.base;

        resolvedConfig.server ||= {};
        resolvedConfig.server.fs ||= {};
        resolvedConfig.server.fs.allow ||= [];

        options.groups.forEach((group) => {
          resolvedConfig.server.fs.allow.push(normalizePath(group.src));
        });
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
        importPath: 'kolay/test-support',
        content: stripIndent`
          import { setupKolay as setup } from 'kolay/setup';

          export function setupKolay(hooks, config) {
            hooks.beforeEach(async function () {
              let docs = this.owner.lookup('service:kolay/docs');

              await setup(this, config);
            });
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
              glob: glob('./{app,src}/templates/**/*.{md,gjs.md,gts.md}', {
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
              cwd: group.src,
              glob: glob('**/*.{md,gjs.md,gts.md}', {
                cwd: normalizePath(group.src),
                exclude: ['node_modules'],
              }),
            });
          }

          const manifest = {
            groups: [],
          };

          for (const config of globs) {
            const paths = [];

            for await (const entry of config.glob) {
              const name =
                baseUrl +
                (config.name ? config.name + '/' : '') +
                entry.replace(/^(app|src)\/templates\//, '').replace(/\.(gjs|gts)\.md$/, '');
              const full = '/@fs' + join(normalizePath(config.cwd), entry);

              result[name] = `() => import("${full}")`;
              paths.push(entry);
            }

            const found = await reshape({
              cwd: config.cwd,
              paths,
              prefix: baseUrl + config.name,
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

          console.log(virtualFile);

          return virtualFile;
        },
      },
    ]),
  };
};
