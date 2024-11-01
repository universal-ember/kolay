/**
 * This plugin is *basically* what v1 addons did.
 */
import { stripIndent } from 'common-tags';

import { virtualFile } from './helpers.js';

/** @type {() => import('unplugin').UnpluginOptions} */
export const setup = () => {
  return {
    name: 'kolay-setup',
    ...virtualFile([
      {
        importPath: 'kolay/setup',
        content: stripIndent`
          import { getOwner } from '@ember/owner';
          import { assert } from '@ember/debug';

          export async function setupKolay(context, options) {
            let owner = getOwner(context);            

            assert(
              \`Expected owner to exist on the passed context, \`
              + \`the first parameter passed to setup, but it did not. \`
              + \`Please make sure you pass a framework object as the first paramter to setup, \`
              + \`or make sure that the context that is passed has, at some point, \`
              + \`had setOwner called on it\`, 
              owner
            );

            let docs = owner.lookup('service:kolay/docs');

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
            let [apiDocs, manifest] = await Promise.all([
              import('kolay/api-docs:virtual'),
              import('kolay/manifest:virtual'),
            ]);

            await docs.setup({
              apiDocs,
              manifest, 
              ...options,
            });

            return docs.manifest;
          }
        `,
      },
      // NOTE: we can't have a virtual module import
      //       more virtual modules under embroide.
      //       :(
      //       So the whole strategy / benefit of setupKolay is
      //       .... much less useful than originally planned
      //
      //
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
    ]),
  };
};
