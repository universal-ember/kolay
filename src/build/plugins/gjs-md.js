import assert from 'node:assert';

import { Preprocessor } from 'content-tag';
import { parseMarkdown } from 'repl-sdk/markdown/parse';

const processor = new Preprocessor();

function componentNameFromId(id) {
  return id
    .split(/[^A-Za-z0-9_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
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
  const VIRTUAL_PREFIX = 'kolay:gjs-md:';
  /**
   * Map of:
   *   .gjs.md -> Map of
   *                virtual module id -> CodeBlock
   * @type {Map<string, Map<string, CodeBlock>>>}
   */
  const virtualModulesByMarkdownFile = new Map();

  /**
   * @param {CodeBlock} block
   */
  function toVirtualId(block) {
    return `${VIRTUAL_PREFIX}${block.placeholderId}.gjs`;
  }

  return {
    name: 'kolay:gjs.md',
    /**
     * We need to run before babel *and* embroider's gjs processing.
     * */
    // enforce: 'pre',
    resolveId(id, parent) {
      if (typeof id === 'string' && id.startsWith(VIRTUAL_PREFIX)) {
        return `${id}?from=${parent}`;
      }

      return null;
    },
    load(id) {
      if (typeof id === 'string' && id.startsWith(VIRTUAL_PREFIX)) {
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

        console.log({ id, code });

        return {
          code,
          map,
        };
      }

      return null;
    },
    async transform(input, id) {
      if (!id.endsWith('.gjs.md')) return;

      /**
       * Convert to GJS!
       */
      const result = await parseMarkdown(input, {
        remarkPlugins: options?.remarkPlugins,
        rehypePlugins: options?.rehypePlugins,
        isLive: (meta) => meta?.includes('live'),
        isPreview: (meta) => meta?.includes('preview'),
        isBelow: (meta) => meta.includes('below'),
        needsLive: () => true,
        ALLOWED_FORMATS: ['gjs', 'hbs'],
        getFlavorFromMeta: () => null,
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

      const built =
        (options?.scope ?? '') + '\n\n' + imports + '\n\n' + `<template>${result.text}</template>`;

      const { code, map } = processor.process(built, {
        filename: id,
      });

      return {
        code,
        map,
      };
    },
  };
}
