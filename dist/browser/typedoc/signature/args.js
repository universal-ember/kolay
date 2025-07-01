
import { Comment, isNamedTuple, Type, isIntrinsic } from '../renderer.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

const not = x => !x;
const isComponent = kind => kind === 'component';
/**
 * Only components' args are prefixed with a `@`,
 * because only components have template-content.
 */
const Args = setComponentTemplate(precompileTemplate("\n  {{#if @info}}\n    <h3 class=\"typedoc__heading\">Arguments</h3>\n    {{#each (listifyArgs @info) as |child|}}\n      <span class=\"typedoc__{{@kind}}-signature__arg\">\n        <span class=\"typedoc__{{@kind}}-signature__arg-info\">\n          <pre class=\"typedoc__name\">{{if (isComponent @kind) \"@\"}}{{child.name}}</pre>\n          {{#if (isIntrinsic child.type)}}\n            <Type @info={{child.type}} />\n          {{else if (isNamedTuple child)}}\n            <Type @info={{child.element}} />\n          {{/if}}\n        </span>\n\n        {{#if (getFlags child.flags)}}\n          {{!-- we can potentially display more flags here in the future --}}\n          <Flags @flags={{child.flags}} />\n        {{/if}}\n\n        {{#if (not (isIntrinsic child.type))}}\n          <Type @info={{child.type}} />\n        {{else if (isNamedTuple child)}}\n          <Type @info={{child.element}} />\n        {{else}}\n          <Comment @info={{child}} />\n        {{/if}}\n      </span>\n    {{/each}}\n  {{/if}}\n", {
  strictMode: true,
  scope: () => ({
    listifyArgs,
    isComponent,
    isIntrinsic,
    Type,
    isNamedTuple,
    getFlags,
    Flags,
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
  * in which case, we want to create [...Positional, Named]
  */
  if ('children' in info && Array.isArray(info.children)) {
    if (info.children.length <= 2) {
      const flattened = flattenArgs(info.children);
      if (flattened.length > 0) {
        return flattened;
      }
    }
    return info.children;
  }
  let declaration = null;
  if ('type' in info && info.type && 'declaration' in info.type && info.type.declaration) {
    declaration = info.type.declaration;
  }
  if ('type' in info && info.type && info.type.type === 'reference') {
    declaration = info.project.getReflectionById(info.type['_target']);
  }
  if (declaration) {
    return listifyArgs(declaration);
  }
  console.warn('unhandled', info);
  return [];
}
function flattenArgs(args) {
  const named = args.find(x => x.name === 'Named');
  const positional = args.find(x => x.name === 'Positional');
  const result = [];
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
  if (!info) return [];
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
const Flags = setComponentTemplate(precompileTemplate("\n  <span class=\"typedoc__arg-flags\">\n    {{#each (getFlags @flags) as |flag|}}\n      <span class=\"typedoc__flag\">{{flag}}</span>\n    {{/each}}\n  </span>\n", {
  strictMode: true,
  scope: () => ({
    getFlags
  })
}), templateOnly());
function getFlags(flags) {
  // extremely simplified logic to determine flags, for now we only interested in `isOptional`
  return [flags?.isOptional && 'optional'].filter(Boolean);
}

export { Args, getArgs };
//# sourceMappingURL=args.js.map
