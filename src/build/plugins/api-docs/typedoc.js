import assert from 'node:assert';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { globby } from 'globby';

import { packageTypes } from '../helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Generates APIDocs / TypeDoc from already built declarations. This is meant to use be very permissive and ignore errors so that likelihood of generating a TypeDoc json document increases.
 * Over time, this'll probably need to be tweaked, and maybe one day will need an extension API, but for now the only option is specifying which `packageName` to try to generate types for.
 *
 * Package lookup occurs relative to the package at the current working directory, using `require.resolve`.
 * So only packages declared as (dev)dependencies entries can be found.
 *
 * @typedef {object} Options
 * @property {string} packageName
 *
 * @param {Options} options
 * @return {Promise<unknown | undefined>} either the built JSON document, or undefined
 */
export async function generateTypeDocJSON({ packageName }) {
  /**
   * all "types" from package.json#exports
   */
  const typeInfo = await packageTypes(packageName);
  const entries = typeInfo.types;

  assert(
    entries?.length,
    `Could not find any types for ${packageName}. Make sure that the package.json specifies "types" entries in package.json#exports`
  );

  const resolvedEntries = await resolveFiles(typeInfo.dir, entries);
  const absoluteResolved = resolvedEntries.map((entry) => join(typeInfo.dir, entry));

  const typedoc = await import('typedoc');
  const tmpTSConfigPath = `/tmp/kolay-typedoc-${packageName.replace('/', '__').replace('@', 'at__')}.json`;
  const extendsTsConfig = require.resolve('@ember/app-tsconfig/tsconfig.json');

  // const home = process.cwd();
  // const homeRequire = createRequire(home);
  const types = [
    'ember-source/types/stable',
    'ember-modifier',
    '@glimmer/component',
    // homeRequire.resolve('ember-source/types/stable/index.d.ts')
  ];

  async function extractTypeLocation(t) {
    try {
      const entries = await packageTypes(t);

      if (entries.types[0]) {
        return join(entries.dir, entries.types[0]).replace('/*', '');
      }

      return join(process.cwd(), 'node_modules', t);
    } catch {
      return join(process.cwd(), 'node_modules', t);
    }
  }

  const resolvedTypes = (await Promise.all(types.map(async (t) => extractTypeLocation(t)))).filter(
    (x) => !!x
  );

  resolvedTypes.push(resolve(__dirname, '..', '..', '..', 'fake-glint-template.d.ts'));

  const tsConfig = {
    extends: extendsTsConfig,
    include: [...new Set(absoluteResolved.map((entry) => dirname(entry)))],
    compilerOptions: {
      baseUrl: typeInfo.dir,
      noEmitOnError: false,
      types: resolvedTypes,
    },
  };

  await writeFile(tmpTSConfigPath, JSON.stringify(tsConfig, null, 2));

  const typedocApp = await typedoc.Application.bootstrapWithPlugins({
    entryPoints: absoluteResolved,
    tsconfig: tmpTSConfigPath,
    basePath: typeInfo.dir,
    cleanOutputDir: false,
    pretty: false,
    excludeInternal: false,
    excludeExternals: true,
    skipErrorChecking: true,
    // All types to be referenced in docs must be exported.
    // This plugin does not work with the latest typedoc
    // plugin: ['@zamiell/typedoc-plugin-not-exported'],
  });

  const project = await typedocApp.convert();

  if (project) {
    let data = typedocApp.serializer.projectToObject(project, typeInfo.dir);

    return data;
  }

  return;
}

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
