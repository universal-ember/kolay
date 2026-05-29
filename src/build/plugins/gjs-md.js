import { readFile } from 'node:fs/promises';

import * as babel from '@babel/core';
import { Preprocessor } from 'content-tag';
import { buildCompiler, parseMarkdown } from 'repl-sdk/markdown/parse';
import {
  mergeImports,
  replacePlaceholder,
  splitModule,
  wrapAsConst,
} from 'repl-sdk/render-to-string';

import { extFilter } from './utils.js';

const processor = new Preprocessor();

/**
 * Turn a placeholder id like `repl_1` into a Glimmer-invokable PascalCase
 * tag name. We keep the per-document numbering stable so debugging is easier.
 *
 * @param {string} id
 * @param {number} nth
 */
function demoName(id, nth) {
  return `Demo${nth}_${id.replace(/[^A-Za-z0-9_]/g, '_')}`;
}

/**
 * @param {Options} options
 */
export function createCompiler(options) {
  return buildCompiler({
    remarkPlugins: options.remarkPlugins,
    rehypePlugins: options.rehypePlugins,
    isLive: (meta) => meta?.includes('live'),
    isPreview: (meta) => meta?.includes('preview'),
    isBelow: (meta) => meta.includes('below'),
    needsLive: () => true,
    ALLOWED_FORMATS: ['gjs', 'hbs'],
    getFlavorFromMeta: () => null,
  });
}

/**
 * Transform a `.gjs.md` document into a single `.gjs` module that inlines
 * every live code fence as a Glimmer component sibling of the prose.
 *
 * Pipeline:
 *
 *   1. `parseMarkdown` (from repl-sdk) returns the HTML body + an array of
 *      `liveCode` blocks, with `<div id="placeholderId">…</div>` holes
 *      where each demo should land.
 *   2. For every live block we preprocess its code with `content-tag` so
 *      `<template>` syntax becomes plain JS. The block's source code is now
 *      a regular ES module ending in `export default _component;`.
 *   3. `splitModule` lifts each demo's top-level imports out of its body
 *      and rewrites `export default <expr>` to `return <expr>`; the body
 *      goes inside an IIFE bound to a unique PascalCase const (e.g.
 *      `const Demo1_repl_1 = (() => { …; return _component; })();`).
 *   4. `replacePlaceholder` rewrites each `<div id="placeholderId">` in the
 *      prose to a Glimmer invocation of the const, wrapped in a div that
 *      preserves the original placeholder's class so existing demo CSS
 *      still applies.
 *   5. The final output is:
 *
 *        <user-supplied scope JS>
 *        <merged imports from every demo, deduped>
 *        <one IIFE-const per demo>
 *        <template>{ rewritten prose with <DemoX /> invocations }</template>
 *
 *      which we hand back to `content-tag` once more to turn the trailing
 *      `<template>` into a `template(...)` call. Because that `<template>`
 *      sits at module scope, content-tag's auto-scope picks up every demo
 *      const AND every identifier defined in the user-supplied scope JS —
 *      no manual `scope: () => ({...})` list needed.
 *
 * @param {string | Buffer} input
 * @param {{ compiler: unknown; id: string; scope?: string }} options
 * @returns {Promise<{ code: string, map: unknown }>}
 */
export async function mdToGJS(input, { compiler, id, scope }) {
  const result = await parseMarkdown(input.toString(), { compiler });

  const importGroups = [];
  const demoDecls = [];
  let rewrittenProse = result.text;
  let nth = 0;

  for (const block of result.codeBlocks ?? []) {
    const placeholderId = block?.id ?? block?.placeholderId;

    if (!placeholderId) continue;

    nth++;

    const name = demoName(placeholderId, nth);
    const isHbs = block.format === 'hbs';
    const demoInput = isHbs
      ? `${scope ?? ''}\n\n<template>\n${block.code}\n</template>`
      : block.code;

    const { code: preprocessed } = processor.process(demoInput, {
      filename: `${id}#${placeholderId}`,
    });

    const { imports, body } = splitModule(preprocessed);

    importGroups.push(imports);
    demoDecls.push(wrapAsConst(body, name));

    rewrittenProse = replacePlaceholder(rewrittenProse, placeholderId, name);
  }

  const mergedImports = mergeImports(importGroups).join('\n');

  const built =
    `${scope ?? ''}\n\n` +
    `${mergedImports}\n\n` +
    `${demoDecls.join('\n\n')}\n\n` +
    `<template>${rewrittenProse}</template>\n`;

  const processed = processor.process(built, { filename: id });

  // content-tag emits a fresh `import { template as template_<hash> } from
  // '@ember/template-compiler'` every time it runs. Each demo went through
  // its own preprocess pass, and the final pass over the assembled module
  // adds one more — same hash since the filename is shared, but JS still
  // rejects two imports binding the same identifier. Collapse them.
  return {
    code: dedupeTopLevelImports(processed.code),
    map: processed.map,
  };
}

/**
 * Deduplicate identical top-level `import` statements in a JS module string,
 * preserving the first occurrence and dropping subsequent exact-text matches.
 *
 * This is a textual dedup — it only removes lines that match character-for-
 * character, which is exactly the failure case we care about (content-tag's
 * deterministic hashed-template import emitted multiple times).
 *
 * @param {string} code
 */
function dedupeTopLevelImports(code) {
  const seen = new Set();
  /** @type {string[]} */
  const out = [];

  for (const line of code.split('\n')) {
    if (/^\s*import\s/.test(line) && line.trimEnd().endsWith(';')) {
      const key = line.trim();

      if (seen.has(key)) continue;

      seen.add(key);
    }

    out.push(line);
  }

  return out.join('\n');
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
  const compiler = createCompiler(options);

  return [
    {
      name: 'kolay:gjs.md',
      /**
       * We need to run before babel *and* embroider's gjs processing.
       */
      enforce: 'pre',
      load: {
        filter: extFilter('.gjs.md'),
        async handler(id) {
          const input = await readFile(id);
          const { code, map } = await mdToGJS(input, {
            id,
            compiler,
            scope: options.scope,
          });

          return babel.transformAsync(code, {
            inputSourceMap: map.mapping,
            sourceType: 'module',
            sourceMap: true,
            filename: id,
          });
        },
      },
    },
  ];
}
