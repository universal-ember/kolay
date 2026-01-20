import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { dirname, join, parse as parsePath } from 'node:path';

import JSON5 from 'json5';

import { betterSort } from './sort.js';

/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 *
 * @returns {Promise<import('./types.ts').Collection>}
 */
export async function parse(paths, cwd) {
  const docs = await gather(paths, cwd);
  const unsorted = build(docs);
  const sorted = deepSort(deepSort(unsorted));

  return sorted;
}

/**
 * Mutates the original structure like Array.prototype.sort,
 * but deeply.
 * @template T
 * @param {T} input
 * @returns {T}
 */
function deepSort(input) {
  assert(typeof input === 'object' && input !== null, `Cannot deepSort; ${input}`);

  if ('pages' in input && Array.isArray(input.pages)) {
    input.pages = input.pages.sort(betterSort('name'));

    /** @type {any} */
    const pages = input.pages;

    pages.map((/** @type {T} */ page) => deepSort(page));
  }

  return input;
}

/**
 *
 * @param {string} segment
 * @returns {string}
 */
export function cleanSegment(segment) {
  return stripExt(segment.replaceAll(/\d/g, '').replaceAll('-', ' ')).trim();
}

/**
 *
 * @param {import('./types.ts').GatheredDocs} docs
 */
export function build(docs) {
  /** @type {import('./types.ts').Collection} */
  const result = { name: 'root', pages: [], path: 'root' };

  for (const { mdPath, config } of docs) {
    if (!mdPath.includes('/')) {
      console.warn(
        `markdown path, ${mdPath}, is not contained within a folder. It will be skipped.`
      );
      continue;
    }

    const parts = mdPath.split('/');
    const [name, ...reversedGroups] = parts.reverse();
    const groups = reversedGroups.reverse();

    if (groups.length === 0) continue;
    if (!name) continue;

    /** @type {import('./types.ts').Collection} */
    let leafestCollection = result;
    let leafestGroupName;
    const groupStack = [];

    for (const group of groups) {
      groupStack.push(group);

      /** @type {any} */
      let currentCollection = leafestCollection.pages.find(
        (page) => 'pages' in page && page.name === group
      );

      if (!currentCollection) {
        /** @type {import('./types.ts').Collection} */
        currentCollection = {
          path: group,
          /**
           * Since we sort on 'name' (above),
           * this must be the original group name.
           */
          name: group,
          /**
           * the cleaned name, potentially for UI display purposes.
           * however, the original name is "name" or "path" so
           * that could be used in case cleanedName does not fit the needs
           * of the consuming project.
           */
          cleanedName: cleanSegment(group),

          pages: [],
        };

        preAddCheck(groupStack.join('/'), group, leafestCollection);
        leafestCollection.pages.push(currentCollection);
      }

      leafestCollection = currentCollection;
      leafestGroupName = group;
    }

    assert(
      leafestGroupName,
      'Could not determine group name. A group / folder is required for each file.'
    );

    const groupName = cleanSegment(leafestGroupName);
    const cleanedName = cleanSegment(name);

    const pageInfo = {
      ...config,
      path: `/${mdPath}`,
      // Removes the file extension
      name: name.replace(/\.\w+$/, ''),
      groupName,
      cleanedName,
    };

    preAddCheck(mdPath, cleanedName, leafestCollection);

    leafestCollection.pages.push(pageInfo);
  }

  return result;
}

/**
 * @param {string} attemptedPath
 * @param {string} searchFor
 * @param {import('./types.ts').Collection} collection
 */
function preAddCheck(attemptedPath, searchFor, collection) {
  const matching = collection.pages.find((page) => stripExt(page.name) === searchFor);

  if (matching) {
    const suggestion = stripExt(attemptedPath);

    if (attemptedPath.endsWith('.md')) {
      assert(
        false,
        `Cannot have a group that matches the name of an individual page. ` +
          `Please move ${attemptedPath} into the "${matching.name}" folder. ` +
          `If you want this to be the first page, rename the file to ${suggestion}/index.md`
      );
    } else if ('path' in matching) {
      const folder = stripExt(matching.path);

      assert(
        false,
        `Cannot have a group that matches the name of an individual page. ` +
          `Please move ${matching.name}.md into the "${folder}" folder. ` +
          `If you want this to be the first page, rename the file to ${suggestion}/index.md`
      );
    }
  }
}

/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 *
 * @returns { Promise<import('./types.ts').GatheredDocs> }
 */
async function gather(paths, cwd) {
  const { join } = await import('node:path');

  const markdown = paths.filter((path) => path.endsWith('.md'));
  const configs = filterConfigs(paths);

  /**
   * @param {string} path
   */
  async function configFor(path) {
    const foundPath = configs.find((configPath) => {
      const configPathWithoutExtension = configPath.replace(/\.json$/, '');

      return path.startsWith(configPathWithoutExtension);
    });

    if (!foundPath) return {};

    const fullPath = join(cwd, foundPath);
    const config = await readJSONC(fullPath);

    return config;
  }

  /** @type { Array<{ mdPath: string, config: object }> } */
  const docPairs = [];

  for (const path of markdown) {
    if (!path.includes('/')) {
      continue;
    }

    const config = await configFor(path);

    docPairs.push({ mdPath: path, config });
  }

  return docPairs;
}

/**
 * @param {string} str
 */
function stripExt(str) {
  const parsed = parsePath(str);

  return join(parsed.dir, parsed.name);
}

/**
 * @param {string[]} paths
 */
function filterConfigs(paths) {
  return paths.filter((path) => path.endsWith('.json') || path.endsWith('.jsonc'));
}

/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 */
export async function configsFrom(paths, cwd) {
  const configs = filterConfigs(paths);

  const result = [];

  for (const foundPath of configs) {
    const fullPath = join(cwd, foundPath);
    const config = await readJSONC(fullPath);

    const dir = dirname(foundPath);
    const path = dir === '.' ? 'root' : join('root', dir);

    result.push({ path: path, config });
  }

  return result;
}

/**
 * @param {string} filePath
 */
async function readJSONC(filePath) {
  const buffer = await readFile(filePath);
  const str = buffer.toString();
  const config = JSON5.parse(str);

  return config;
}
