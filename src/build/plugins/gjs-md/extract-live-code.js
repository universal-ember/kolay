import { visit } from 'unist-util-visit';

import { GLIMDOWN_RENDER } from './const.js';

function isPreview(meta) {
  if (!meta) return false;

  return meta.includes('preview');
}

function isBelow(meta) {
  if (!meta) return false;

  return meta.includes('below');
}

function isLive(meta) {
  if (!meta) return false;

  return meta.includes('live');
}

function isSupported(lang) {
  return lang === 'gjs';
}

function isRelevantCode(node) {
  if (node.type !== 'code') return false;

  let { meta, lang } = node;

  if (!lang) {
    return false;
  }

  meta = meta?.trim() ?? '';

  if (!isLive(meta)) {
    return false;
  }

  if (!isSupported(lang)) {
    return false;
  }

  return true;
}

function componentNameFromId(id) {
  // Ember/Glimmer angle-bracket component invocations must be capitalized,
  // and should be valid JS identifiers for GJS scope.
  // demo-12 -> Demo12
  return id
    .split(/[^A-Za-z0-9_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Swaps live codeblocks with placeholders that the compiler can then
// use to insert compiled-from-other-sources' code into those placeholders.
export function liveCodeExtraction(_options = { /* no options */ }) {
  function flatReplaceAt(array, index, replacement) {
    array.splice(index, 1, ...replacement);
  }

  // because we mutate the tree as we iterate,
  // we need to make sure we don't loop forever
  const seen = new Set();

  let id = 0;

  function nextId() {
    return 'demo-' + id++;
  }

  return function transformer(tree, file) {
    visit(tree, ['code'], function (node, index, parent) {
      if (parent === null || parent === undefined) return;
      if (index === null || index === undefined) return;
      if (node.type !== 'code') return;

      const codeNode = node;

      const isRelevant = isRelevantCode(codeNode);

      if (!isRelevant) {
        parent.children[index] = codeNode;

        return 'skip';
      }

      if (seen.has(codeNode)) {
        return 'skip';
      }

      seen.add(codeNode);

      const { meta, lang, value } = codeNode;

      if (!lang) {
        return 'skip';
      }

      if (!meta) {
        return 'skip';
      }

      file.data.liveCode ??= [];

      const code = value.trim();
      const id = nextId();
      const componentName = componentNameFromId(id);

      const invokeNode = {
        type: 'html',
        data: {
          hProperties: {
            [GLIMDOWN_RENDER]: true,
          },
        },
        value: `<${componentName} />`,
      };

      const wrapper = codeNode;

      file.data.liveCode.push({
        format: lang,
        code,
        id,
        componentName,
        meta,
      });

      // Note: `isLive` only inspects `meta`; the `lang` arg is ignored.
      const live = isLive(meta || '', lang);
      const preview = isPreview(meta || '');
      const below = isBelow(meta || '');

      if (live && preview && below) {
        flatReplaceAt(parent.children, index, [wrapper, invokeNode]);

        return 'skip';
      }

      if (live && preview) {
        flatReplaceAt(parent.children, index, [invokeNode, wrapper]);

        return 'skip';
      }

      if (live) {
        parent.children[index] = invokeNode;

        return 'skip';
      }

      parent.children[index] = wrapper;
    });
  };
}
