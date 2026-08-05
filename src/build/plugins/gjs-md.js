import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { sep } from 'node:path';

import * as babel from '@babel/core';
import { Preprocessor } from 'content-tag';
import { buildCompiler, parseMarkdown } from 'repl-sdk/markdown/parse';
import { visit } from 'unist-util-visit';

import { rebaseAuthoredLinks } from '../../rebase-links.js';
import { extFilter, normalizePath } from './utils.js';

const processor = new Preprocessor();

/**
 * Whether a usage's `scope` string already binds `WrapDemo` (an import, a
 * variable, a class, or a function) — if so, the generated import of the
 * default from 'kolay/wrap-demo' would collide with it, and the intent is
 * clearly to wrap demos in that component instead.
 *
 * The scope may contain `<template>` tags, so it goes through content-tag
 * before parsing. Cached per scope string: one usage's scope is parsed once,
 * not once per markdown file.
 *
 * @type {Map<string, boolean>}
 */
const scopeBindsWrapDemoCache = new Map();

/**
 * @param {string | undefined} scope
 */
function scopeBindsWrapDemo(scope) {
  if (!scope) return false;

  let known = scopeBindsWrapDemoCache.get(scope);

  if (known === undefined) {
    known = computeScopeBindsWrapDemo(scope);
    scopeBindsWrapDemoCache.set(scope, known);
  }

  return known;
}

/**
 * @param {string} scope
 */
function computeScopeBindsWrapDemo(scope) {
  let parsed;

  try {
    const { code } = processor.process(scope, { filename: 'kolay-docs-scope.gjs' });

    parsed = babel.parseSync(code, { sourceType: 'module', configFile: false, babelrc: false });
  } catch {
    // A scope that doesn't parse fails the build anyway, when it's prepended
    // to a page's module — that error has the better context.
    return false;
  }

  return (parsed?.program.body ?? []).some((node) => {
    switch (node.type) {
      case 'ImportDeclaration':
        return node.specifiers.some((specifier) => specifier.local.name === 'WrapDemo');
      case 'VariableDeclaration':
        return node.declarations.some(
          (declaration) =>
            declaration.id.type === 'Identifier' && declaration.id.name === 'WrapDemo'
        );
      case 'ClassDeclaration':
      case 'FunctionDeclaration':
        return node.id?.name === 'WrapDemo';
      default:
        return false;
    }
  });
}

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

    // 'glimmer_raw' too: a consumer's wrapDemos runs before this and
    // retypes the placeholder — replacing the first `</div>` still targets
    // the placeholder itself, inside the wrapper.
    visit(tree, ['raw', 'glimmer_raw'], (node) => {
      if (node.tagName === 'code') return 'skip';

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

  if (result.text.includes('<WrapDemo>') && !scopeBindsWrapDemo(scope)) {
    // The opt-in wrapDemos plugin (or the author, by hand) invokes
    // <WrapDemo> — the default renders the demo unchanged. A scope that
    // binds its own WrapDemo wraps demos in that component instead.
    imports = `\nimport { WrapDemo } from 'kolay/wrap-demo';` + imports;
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
 * Each usage's options may configure:
 * - remarkPlugins - Array of remark plugins to use.
 * - rehypePlugins - Array of rehype plugins to use.
 * - scope - functions, components, or values to expose in markdown
 *
 * @param {{ options: object, usages: object[], isPrimary: boolean }} state - this usage's coordination state.
 */
export function gjsmd(state) {
  /**
   * Map of:
   *   .gjs.md -> Map of
   *                virtual module id -> CodeBlock
   * @type {Map<string, Map<string, CodeBlock>>>}
   */
  const virtualModulesByMarkdownFile = new Map();

  /**
   * Rebase authored root-absolute URLs onto the app's base URL, mirroring
   * what the docs service does for runtime-compiled `.md`. The base is only
   * known once vite resolves its config — after this compiler is built — so
   * the plugin reads it lazily (and stays a no-op under webpack, where no
   * hook updates it).
   */
  let base = '/';

  /**
   * Which usage's markdown options apply to a given file: the usage owning
   * the group whose src directory contains the file. Files outside every
   * group (e.g. the co-located app/src templates) use the first usage.
   *
   * (The first usage's instance of this plugin handles every `.gjs.md`
   *  file — it is the first to respond to the load hook — so it has to
   *  route between the usages' configs itself.)
   */
  function usageFor(id) {
    const path = id.replace(/^\/@fs/, '');

    for (const usage of state.usages) {
      for (const group of usage.groups ?? []) {
        const dir = normalizePath(group.src);

        if (path === dir || path.startsWith(dir.endsWith(sep) ? dir : dir + sep)) {
          return usage;
        }
      }
    }

    return state.usages[0];
  }

  /** One compiler per usage — each usage may configure different plugins */
  const compilers = new Map();

  function compilerFor(usage) {
    let compiler = compilers.get(usage);

    if (!compiler) {
      compiler = createCompiler({
        ...usage,
        remarkPlugins: [rebaseAuthoredLinks(() => base), ...(usage.remarkPlugins ?? [])],
      });
      compilers.set(usage, compiler);
    }

    return compiler;
  }

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
            const scope = (fromId ? usageFor(fromId).scope : state.options.scope) ?? '';

            hbsCode = scope + `\n\n<template>\n${block.code}\n</template>`;
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
      /**
       * Unlike setup.js, these plugin entries reach vite as raw plugins
       * (nested array), so the hook lives directly on the object rather
       * than under a `vite` key.
       */
      configResolved(resolvedConfig) {
        base = resolvedConfig.base;
      },
      load: {
        filter: extFilter('.gjs.md'),
        async handler(id) {
          const input = await readFile(id);
          const usage = usageFor(id);

          const { code, map } = await mdToGJS(input, {
            id,
            compiler: compilerFor(usage),
            virtualModulesByMarkdownFile,
            scope: usage.scope,
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
