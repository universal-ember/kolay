import assert from 'node:assert';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { globby } from 'globby';
import { createUnplugin } from 'unplugin';

import { packageTypes } from './helpers.js';

const require = createRequire(import.meta.url);

/**
 * Generates JSON from typedoc given a target path.
 *
 * May be used multiple times to generate multiple docs
 * for multiple libraries
 *
 * example:
 * ```js
 * import { typedoc, helpers } from 'kolay';
 *
 * typedoc.webpack({
 *   dest: '/api-docs/ember-primitives.json
 *   entryPoints: [
 *     helpers.pkgGlob(
 *       require.resolve('ember-primitives'),
 *        'declarations'
 *      )
 *   ]
 * })
 * ```
 */
export const apiDocs = createUnplugin(
  (
    /**
     * options may contain a 'outFile' option
     */
    options
  ) => {
    const name = 'kolay::typedoc';
    const dest = options.dest ?? `docs/${options.package}.json`;

    return {
      name,
      /**
       * 1. generate typedoc config
       * 2. given the
       */
      async buildEnd() {
        /**
         * all "types" from package.json#exports
         */
        const typeInfo = await packageTypes(options.package);
        const entries = typeInfo.types;

        assert(
          entries?.length,
          `Could not find any types for ${options.package}. Make sure that the package.json specifies "types" entries in package.json#exports`
        );

        const resolvedEntries = await resolveFiles(typeInfo.dir, entries);
        const absoluteResolved = resolvedEntries.map((entry) => join(typeInfo.dir, entry));

        const typedoc = await import('typedoc');
        const tmpTSConfigPath = `/tmp/kolay-typedoc-${options.package}.json`;
        const extendsTsConfig = require.resolve('@tsconfig/ember/tsconfig.json');

        const tsConfig = {
          extends: extendsTsConfig,
          include: [join(typeInfo.dir, '**/*')],
          compilerOptions: {
            baseUrl: typeInfo.dir,
            noEmitOnError: false,
          },
        };

        await writeFile(tmpTSConfigPath, JSON.stringify(tsConfig, null, 2));

        const typedocApp = await typedoc.Application.bootstrapWithPlugins({
          // entryPoints: resolvedEntries,
          entryPoints: absoluteResolved,
          tsconfig: tmpTSConfigPath,
          basePath: typeInfo.dir,
          cleanOutputDir: false,
          includes: typeInfo.dir,
          readme: '',
          pretty: false,
          excludeInternal: false,
          skipErrorChecking: true,
          plugin: ['@zamiell/typedoc-plugin-not-exported'],
        });

        const project = await typedocApp.convert();

        if (project) {
          let data = typedocApp.serializer.projectToObject(project, typeInfo.dir);

          this.emitFile({
            type: 'asset',
            fileName: dest,
            source: JSON.stringify(data),
          });
        }
      },
    };
  }
);

/**
 * Converts array of package.json#export types globs to
 * a list of files that actually exist on disk.
 *
 * @param {string} dir
 * @param {string[]} entries
 */
async function resolveFiles(dir, entries) {
  let globbyGlobs = [];

  for (let entry of entries) {
    globbyGlobs.push(entry);

    // exports * are expanded to **/*
    // but we have to do it manually
    if (entry.match(/[^*]\/\*\.d\.ts$/)) {
      globbyGlobs.push(entry.replace('/*.d.ts', '/**/*.d.ts'));
    }
  }

  let resolvedEntries = await globby(globbyGlobs, { cwd: dir });

  return resolvedEntries;
}
