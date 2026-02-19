import assert from 'node:assert';
import { readFile } from 'node:fs/promises';

import * as babel from '@babel/core';
import { Preprocessor } from 'content-tag';
import { buildCompiler, parseMarkdown } from 'repl-sdk/markdown/parse';
import { visit } from 'unist-util-visit';

import { extFilter } from './utils.js';

const processor = new Preprocessor();

function componentNameFromId(id) {
  return id
    .split(/[^A-Za-z0-9_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
    .toLowerCase();
}

function rehypeInjectComponentInvocation() {
  return (tree, file) => {
    const liveCode = /** @type {unknown[]} */ (file?.data?.liveCode ?? []);

    if (!Array.isArray(liveCode) || liveCode.length === 0) return;

    const componentNamesById = new Map();

    for (const block of liveCode) {
      const demoId = block?.id ?? block?.placeholderId;

      if (!demoId || typeof demoId !== 'string') continue;

      const componentName = block?.componentName ?? componentNameFromId(demoId);

      componentNamesById.set(demoId, componentName);
    }

    if (componentNamesById.size === 0) return;

    visit(tree, 'raw', (node) => {
      if (node.tagName === 'code') return 'skip';
      if (node.type !== 'raw') return;

      const id = node.value?.match(/id="([^"]+)"/)?.[1];

      if (!id || typeof id !== 'string') return;

      const componentName = componentNamesById.get(id);

      if (!componentName) return;

      node.value = node.value.replace(`</div>`, `<${componentName} /></div>`);
    });
  };
}

/**
 * @porom {Options} options
 */
export function createCompiler(options) {
  const rehypePlugins = [...(options.rehypePlugins ?? []), rehypeInjectComponentInvocation];

  const compiler = buildCompiler({
    remarkPlugins: options.remarkPlugins,
    rehypePlugins,
    isLive: (meta) => meta?.includes('live'),
    isPreview: (meta) => meta?.includes('preview'),
    isBelow: (meta) => meta.includes('below'),
    needsLive: () => true,
    ALLOWED_FORMATS: ['gjs', 'hbs'],
    getFlavorFromMeta: () => null,
  });

  return compiler;
}

/**
 * @param {string} input
 * @param {{ compiler: unknown; virtualModulesByMarkdownFile: unknown; id: string; scope?: string }} options
 * @return {Promise<{ code: string, map: unknown }>}
 */
export async function mdToGJS(input, { compiler, virtualModulesByMarkdownFile, id, scope }) {
  /**
   * Convert to GJS!
   */
  const result = await parseMarkdown(input, {
    compiler,
  });

  let imports = '';

  virtualModulesByMarkdownFile.delete(id);

  const virtualModules = new Map();

  virtualModulesByMarkdownFile.set(id, virtualModules);

  for (const block of result.codeBlocks ?? []) {
    const demoId = block?.id ?? block?.placeholderId;

    if (!demoId) continue;

    const componentName = block?.componentName ?? componentNameFromId(demoId);
    const virtualId = toVirtualId(block);

    virtualModules.set(virtualId, block);

    imports += `\nimport ${componentName} from '${virtualId}';`;
  }

  const built = (scope ?? '') + '\n\n' + imports + '\n\n' + `<template>${result.text}</template>`;

  return processor.process(built, {
    filename: id,
  });
}

const VIRTUAL_PREFIX_EMBEDDED = 'kolay/virtual:live:';

/**
 * @param {CodeBlock} block
 */
function toVirtualId(block) {
  const ext = block.format === 'hbs' ? 'gjs.hbs' : 'gjs';

  return `${VIRTUAL_PREFIX_EMBEDDED}${block.placeholderId}.${ext}`;
}

/**
 * @typedof {Object} CodeBlock
 * @property {string} format
 * @property {string} code
 * @property {string} placeholderId
 */

/**
 * Build/Vite plugin for authoring markdown with live code fences
 * to be compiled to GJS during build.
 *
 * @typedef {Object} Options
 * @property {unknown[]} [remarkPlugins] - Array of remark plugins to use.
 * @property {unknown[]} [rehypePlugins] - Array of rehype plugins to use.
 * @property {string} [scope] - functions, components, or values to expose in markdown
 *
 * @param {Options} options - Plugin options.
 */
export function gjsmd(options = {}) {
  /**
   * Map of:
   *   .gjs.md -> Map of
   *                virtual module id -> CodeBlock
   * @type {Map<string, Map<string, CodeBlock>>>}
   */
  const virtualModulesByMarkdownFile = new Map();

  const compiler = createCompiler(options);

  return [
    /**
     * Only handles loading of virtual content from live code fences
     */
    {
      name: 'kolay:live',
      resolveId: {
        filter: {
          id: new RegExp(`^${RegExp.escape(VIRTUAL_PREFIX_EMBEDDED)}`),
        },
        async handler(id, parent) {
          return `${id}?from=${parent}`;
        },
      },
      load: {
        filter: {
          id: new RegExp(`^${RegExp.escape(VIRTUAL_PREFIX_EMBEDDED)}`),
        },
        async handler(id) {
          const [actualId, qps] = id.split('?');
          const search = new URLSearchParams(qps);
          const fromId = search.get('from');

          const virtualModules = virtualModulesByMarkdownFile.get(fromId);

          const block = virtualModules.get(actualId);

          assert(block?.code, `Could not find virtual module for id ${actualId} from ${fromId}`);

          let hbsCode;

          if (block.format === 'hbs') {
            hbsCode = (options.scope ?? '') + `\n\n<template>\n${block.code}\n</template>`;
          }

          const { code, map } = processor.process(hbsCode ?? block.code, {
            filename: id,
          });

          return {
            code,
            map,
          };
        },
      },
    },

    /**
     * Transforms .gjs.md -> .gjs -> .js
     *
     * Also sets up the imports for any live code fences.
     *   The content for these liv imports will be handled in the above load hook
     */
    {
      name: 'kolay:gjs.md',
      /**
       * We need to run before babel *and* embroider's gjs processing.
       * */
      enforce: 'pre',
      load: {
        filter: extFilter('.gjs.md'),
        async handler(id) {
          const input = await readFile(id);

          const { code, map } = await mdToGJS(input, {
            id,
            compiler,
            virtualModulesByMarkdownFile,
          });

          return babel.transformAsync(code, {
            inputSourceMap: map.mapping, //new SourceMapConsumer(map),
            sourceType: 'module',
            sourceMap: true,
            filename: id,
          });
        },
      },
    },
  ];
}
