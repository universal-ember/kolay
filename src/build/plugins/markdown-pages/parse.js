import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join, parse as parsePath } from 'node:path';

import JSON5 from 'json5';

import { stripGlimmerMarkdownExtension } from '../../../paths.js';
import { defaultPopulateManifestEntry } from './populate-manifest-entry.js';
import { betterSort } from './sort.js';

/**
 * @typedef {object} ParseOptions
 * @property {Array<{ path: string, data: Record<string, unknown> }>} [frontmatter] per-page frontmatter data, keyed by the same (possibly prefix-stripped) paths as `paths`
 * @property {import('./populate-manifest-entry.js').PopulateManifestEntry} [populateManifestEntry] finalizes each page or directories manifest entry — `defaultPopulateManifestEntry` when not given
 */

/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 * @param {Array<{ path: string, config: object }>} [providedConfigs] already-read configs; when given, configs are taken from here instead of read from disk (the paths may not be resolvable against cwd, e.g. the stripped app/src/templates prefix)
 * @param {ParseOptions} [options]
 *
 * @returns {Promise<import('./types.ts').PageTree>}
 */
export async function parse(paths, cwd, providedConfigs, options) {
  const docs = await gather(paths, cwd, providedConfigs, options);
  const unsorted = build(docs, options?.populateManifestEntry ?? defaultPopulateManifestEntry);
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
 * @param {import('./populate-manifest-entry.js').PopulateManifestEntry} [populate] finalizes each page or directories manifest entry; when omitted, entries are the raw structural default (the direct-call path used by tests)
 */
export function build(docs, populate) {
  /** @type {import('./types.ts').PageTree} */
  const result = { name: 'root', pages: [], path: 'root' };

  for (let { mdPath, config, frontmatter } of docs) {
    const sourcePath = mdPath;

    mdPath = mdPath.replace(/^\.\/(src|app)\/templates\//, '');
    mdPath = mdPath.replace(/^\.\.\//, '');
    mdPath = mdPath.replace(/^\.\//, '');

    const parts = mdPath.split('/');
    const [name, ...reversedGroups] = parts.reverse();
    /**
     * Empty for a file at the root of the source — the page then belongs
     * to the source itself rather than to a folder within it.
     */
    const groups = reversedGroups.reverse();

    if (!name) continue;

    /** @type {import('./types.ts').PageTree} */
    let leafestPageTree = result;
    let leafestGroupName;
    const groupStack = [];

    for (const group of groups) {
      groupStack.push(group);

      /** @type {any} */
      let currentPageTree = leafestPageTree.pages.find(
        (page) => 'pages' in page && page.name === group
      );

      if (!currentPageTree) {
        /** @type {import('./types.ts').PageTree} */
        currentPageTree = {
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

        preAddCheck(groupStack.join('/'), group, leafestPageTree);
        leafestPageTree.pages.push(currentPageTree);
      }

      leafestPageTree = currentPageTree;
      leafestGroupName = group;
    }

    /**
     * A page at the root of the source has no containing folder, so it has
     * no folder name to take a groupName from. The source's own display
     * name is not known here (it comes from the docs() config), so this is
     * left empty rather than guessed at.
     */
    const groupName = leafestGroupName ? cleanSegment(leafestGroupName) : '';
    const cleanedName = cleanSegment(name);
    const path = '/' + stripGlimmerMarkdownExtension(mdPath);

    let pageInfo = {
      ...config,
      path,
      // Removes the file extension
      name: stripExt(name),
      groupName,
      cleanedName,
    };

    // Every markdown or folder entry entry is finalized popuplated using populateManifestEntry
    if (populate) {
      pageInfo = populate(pageInfo, frontmatter ?? {}, { path: sourcePath });
    }

    preAddCheck(mdPath, cleanedName, leafestPageTree);

    leafestPageTree.pages.push(pageInfo);
  }

  return result;
}

/**
 * @param {string} attemptedPath
 * @param {string} searchFor
 * @param {import('./types.ts').PageTree} folder
 */
function preAddCheck(attemptedPath, searchFor, folder) {
  const matching = folder.pages.find((page) => stripExt(page.name) === searchFor);

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
 * @param {Array<{ path: string, config: object }>} [providedConfigs] already-read configs, keyed by the same (possibly prefix-stripped) paths as `paths`
 * @param {ParseOptions} [options]
 *
 * @returns { Promise<import('./types.ts').GatheredDocs> }
 */
async function gather(paths, cwd, providedConfigs, options) {
  const { join } = await import('node:path');

  const markdown = paths.filter((path) => path.endsWith('.md'));

  /** @type {Array<{ path: string, config: object }>} */
  const configs =
    providedConfigs ??
    (await Promise.all(
      filterConfigs(paths).map(async (path) => ({
        path,
        config: await readJSONC(join(cwd, path)),
      }))
    ));

  /**
   * @param {string} path
   */
  function configFor(path) {
    const found = configs.find((entry) => {
      const configPathWithoutExtension = entry.path.replace(/\.jsonc?$/, '');

      return path.startsWith(configPathWithoutExtension);
    });

    return found?.config ?? {};
  }

  /**
   * @param {string} path
   */
  function frontmatterFor(path) {
    return options?.frontmatter?.find((entry) => entry.path === path)?.data;
  }

  /** @type {import('./types.ts').GatheredDocs} */
  const docPairs = [];

  for (const path of markdown) {
    docPairs.push({ mdPath: path, config: configFor(path), frontmatter: frontmatterFor(path) });
  }

  /**
   * A json file with an `href` and no markdown file of its own is a
   * nav-only link entry: it takes part in the nav (name, ordering,
   * display config) like a page, but points at the `href` — e.g. a page
   * in another group.
   */
  for (const entry of configs) {
    if (/(^|\/)meta\.jsonc?$/.test(entry.path)) continue;
    if (typeof entry.config.href !== 'string') continue;

    const configPathWithoutExtension = entry.path.replace(/\.jsonc?$/, '');
    const hasOwnPage = markdown.some((path) => path.startsWith(configPathWithoutExtension));

    if (hasOwnPage) continue;

    docPairs.push({ mdPath: entry.path, config: entry.config });
  }

  return docPairs;
}

/**
 * @param {string} str
 */
function stripExt(str) {
  const parsed = parsePath(str);
  const doubleExt = parsePath(parsed.name);

  return join(parsed.dir, doubleExt.name);
}

/**
 * @param {string[]} paths
 */
function filterConfigs(paths) {
  return paths.filter((path) => path.endsWith('.json') || path.endsWith('.jsonc'));
}

/**
 * @param {string} filePath
 */
export async function readJSONC(filePath) {
  const buffer = await readFile(filePath);
  const str = buffer.toString();
  const config = JSON5.parse(str);

  return config;
}
