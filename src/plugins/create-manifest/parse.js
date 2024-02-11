import assert from 'node:assert';
import { join, parse as parsePath } from 'node:path';

import { betterSort } from './sort.js';

/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 *
 * @returns {Promise<import('./types.ts').Collection>}
 */
export async function parse(paths, cwd) {
  let docs = await gather(paths, cwd);
  let unsorted = build(docs);
  let sorted = deepSort(unsorted);

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
function cleanSegment(segment) {
  return stripExt(segment.replaceAll(/[\d-]/g, ''));
}

/**
 *
 * @param {import('./types.ts').GatheredDocs} docs
 */
export function build(docs) {
  /** @type {import('./types.ts').Collection} */
  let result = { name: 'root', pages: [] };

  for (let { mdPath, config } of docs) {
    if (!mdPath.includes('/')) {
      console.warn(
        `markdown path, ${mdPath}, is not contained within a folder. It will be skipped.`
      );
      continue;
    }

    let parts = mdPath.split('/');
    let [name, ...reversedGroups] = parts.reverse();
    let groups = reversedGroups.reverse();

    if (groups.length === 0) continue;
    if (!name) continue;

    /** @type {import('./types.ts').Collection} */
    let leafestCollection = result;
    let leafestGroupName;
    let groupStack = [];

    for (let group of groups) {
      groupStack.push(group);

      let groupName = cleanSegment(group);

      /** @type {any} */
      let currentCollection = leafestCollection.pages.find(
        (page) => 'pages' in page && page.name === groupName
      );

      if (!currentCollection) {
        /** @type {import('./types.ts').Collection} */
        currentCollection = {
          name: groupName,
          pages: [],
        };

        preAddCheck(groupStack.join('/'), groupName, leafestCollection);
        leafestCollection.pages.push(currentCollection);
      }

      leafestCollection = currentCollection;
      leafestGroupName = group;
    }

    assert(
      leafestGroupName,
      'Could not determine group name. A group / folder is required for each file.'
    );

    let groupName = cleanSegment(leafestGroupName);
    let tutorialName = cleanSegment(name);

    let pageInfo = {
      ...config,
      path: `/${mdPath}`,
      name,
      groupName,
      tutorialName,
    };

    preAddCheck(mdPath, tutorialName, leafestCollection);

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
  let matching = collection.pages.find((page) => stripExt(page.name) === searchFor);

  if (matching) {
    let suggestion = stripExt(attemptedPath);

    if (attemptedPath.endsWith('.md')) {
      assert(
        false,
        `Cannot have a group that matches the name of an individual page. ` +
          `Please move ${attemptedPath} into the "${matching.name}" folder. ` +
          `If you want this to be the first page, rename the file to ${suggestion}/index.md`
      );
    } else if ('path' in matching) {
      let folder = stripExt(matching.path);

      assert(
        false,
        `Cannot have a group that matches the name of an individual page. ` +
          `Please move ${matching.name} into the "${folder}" folder. ` +
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
  const fs = await import('node:fs/promises');
  const { join } = await import('node:path');

  let markdown = paths.filter((path) => path.endsWith('.md'));
  let configs = paths.filter((path) => path.endsWith('.json'));

  /**
   * @param {string} path
   */
  async function configFor(path) {
    let foundPath = configs.find((configPath) => {
      let configPathWithoutExtension = configPath.replace(/\.json$/, '');

      return path.startsWith(configPathWithoutExtension);
    });

    if (!foundPath) return {};

    let fullPath = join(cwd, foundPath);
    let buffer = await fs.readFile(fullPath);
    let str = buffer.toString();
    let config = JSON.parse(str);

    return config;
  }

  /** @type { Array<{ mdPath: string, config: object }> } */
  let docPairs = [];

  for (let path of markdown) {
    if (!path.includes('/')) {
      continue;
    }

    let config = await configFor(path);

    docPairs.push({ mdPath: path, config });
  }

  return docPairs;
}

/**
 * @param {string} str
 */
function stripExt(str) {
  let parsed = parsePath(str);

  return join(parsed.dir, parsed.name);
}
