import { Preprocessor } from 'content-tag';

import { buildCompiler } from './gjs-md/index.js';

const processor = new Preprocessor();

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

  return {
    name: 'kolay:gjs.md',
    /**
     * We need to run before babel *and* embroider's gjs processing.
     * */
    enforce: 'pre',
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

      for (const block of result.data?.liveCode ?? []) {
        const { code, id } = block;

        this.emitFile({
          type: 'asset',
          name: id + '.gjs',
          source: code,
        });

        imports += `\nimport '${id}.gjs';`;
      }

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
