import { Preprocessor } from 'content-tag';

import { buildCompiler } from './gjs-md/index.js';

const processor = new Preprocessor();

function componentNameFromId(id) {
  return id
    .split(/[^A-Za-z0-9_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

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
  const compiler = buildCompiler(options);

  const VIRTUAL_PREFIX = 'kolay:gjs-md:';
  /** @type {Map<string, string>} */
  const virtualModules = new Map();
  /** @type {Map<string, Set<string>>} */
  const virtualModulesByMarkdownFile = new Map();

  function toVirtualId(demoId) {
    return `${VIRTUAL_PREFIX}${demoId}.gjs`;
  }

  return {
    name: 'kolay:gjs.md',
    /**
     * We need to run before babel *and* embroider's gjs processing.
     * */
    enforce: 'pre',
    resolveId(source) {
      if (typeof source === 'string' && source.startsWith(VIRTUAL_PREFIX)) {
        return source;
      }

      return null;
    },
    load(id) {
      if (typeof id === 'string' && id.startsWith(VIRTUAL_PREFIX)) {
        return virtualModules.get(id) ?? null;
      }

      return null;
    },
    // resolveId(id) {
    //   if (id.endsWith('.gjs.md')) {
    //     return INTERNAL_PREFIX + id;
    //   }

    //   return;
    // },
    // loadInclude(id) {
    //   if (!id.startsWith(INTERNAL_PREFIX)) return false;
    // },
    async transform(input, id) {
      if (!id.endsWith('.gjs.md')) return;
      // if (!id.startsWith(INTERNAL_PREFIX)) return;

      /**
       * Convert to GJS!
       */
      // const originalPath = id.slice(INTERNAL_PREFIX.length);
      // const buffer = await readFile(originalPath);
      // const content = buffer.toString();
      const result = await compiler.process(input);

      let imports = '';

      // Clean up stale virtual modules for this markdown file (dev/HMR rebuilds).
      const previousVirtualIds = virtualModulesByMarkdownFile.get(id);

      if (previousVirtualIds) {
        for (const vid of previousVirtualIds) {
          virtualModules.delete(vid);
        }
      }

      const nextVirtualIds = new Set();

      for (const block of result.data?.liveCode ?? []) {
        const demoId = block?.id ?? block?.placeholderId;

        if (!demoId) continue;

        const componentName = block?.componentName ?? componentNameFromId(demoId);
        const virtualId = toVirtualId(demoId);

        virtualModules.set(virtualId, String(block.code ?? ''));
        nextVirtualIds.add(virtualId);

        imports += `\nimport ${componentName} from '${virtualId}';`;
      }

      virtualModulesByMarkdownFile.set(id, nextVirtualIds);

      const built = (options?.scope ?? '') + '\n\n' + imports + '\n\n' + `<template>${result.value}</template>`;

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
