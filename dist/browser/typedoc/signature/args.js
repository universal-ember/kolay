import { isIntrinsic, Type, isNamedTuple, Comment } from '../renderer.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

const not = x => !x;
const isComponent = kind => kind === 'component';
/**
 * Only components' args are prefixed with a `@`,
 * because only components have template-content.
 */
const Args = setComponentTemplate(precompileTemplate("\n  {{#if @info}}\n    <h3 class=\"typedoc__heading\">Arguments</h3>\n    {{#each (listifyArgs @info) as |child|}}\n      <span class=\"typedoc__{{@kind}}-signature__arg\">\n        <span class=\"typedoc__{{@kind}}-signature__arg-info\">\n          <pre class=\"typedoc__name\">{{if (isComponent @kind) \"@\"}}{{child.name}}</pre>\n          {{#if (isIntrinsic child.type)}}\n            <Type @info={{child.type}} />\n          {{else if (isNamedTuple child)}}\n            <Type @info={{child.element}} />\n          {{/if}}\n        </span>\n        {{#if (not (isIntrinsic child.type))}}\n          <Type @info={{child.type}} />\n        {{else if (isNamedTuple child)}}\n          <Type @info={{child.element}} />\n        {{else}}\n          <Comment @info={{child}} />\n        {{/if}}\n      </span>\n    {{/each}}\n  {{/if}}\n", {
  strictMode: true,
  scope: () => ({
    listifyArgs,
    isComponent,
    isIntrinsic,
    Type,
    isNamedTuple,
    not,
    Comment
  })
}), templateOnly());
function listifyArgs(info) {
  if (!info) return [];
  if (Array.isArray(info)) {
    return info;
  }
  /**
  * This object *may* have Named and Positional on them,
  * in which case, we want to create [...Postiional, Named]
  */
  if ('children' in info && Array.isArray(info.children)) {
    if (info.children.length <= 2) {
      let flattened = flattenArgs(info.children);
      if (flattened.length > 0) {
        return flattened;
      }
    }
    return info.children;
  }
  if (info.type && 'declaration' in info.type && info.type.declaration) {
    return listifyArgs(info.type.declaration);
  }
  // eslint-disable-next-line no-console
  console.warn('unhandled', info);
  return [];
}
function flattenArgs(args) {
  let named = args.find(x => x.name === 'Named');
  let positional = args.find(x => x.name === 'Positional');
  let result = [];
  if (positional) {
    result.push(positional.type?.elements);
  }
  if (named) {
    result.push(named);
  }
  return result.flat();
}
/**
 * Returns args for either a function or signature
 */
function getArgs(info) {
  if ('parameters' in info) {
    return info.parameters;
  }
  if (Array.isArray(info)) {
    return info.find(item => item.name === 'Args');
  }
  if ('children' in info) {
    return getArgs(info.children);
  }
}

export { Args, getArgs };
//# sourceMappingURL=args.js.map
