import { Type } from '../renderer.js';
import { Load } from '../utils.js';
import { Args, getArgs } from './args.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

function getSignature(info) {
  /**
  * export const Foo: HelperLike<{...}>
  */
  if (info.variant === 'declaration' && info.type?.type === 'reference' && info.type?.package === '@glint/template' && info.type?.name === 'HelperLike' && Array.isArray(info.type?.typeArguments) && info.type.typeArguments[0] && 'declaration' in info.type.typeArguments[0]) {
    // There can only be one type argument for a HelperLike
    return info.type.typeArguments[0]?.declaration;
  }
  /**
  * export class MyHelper extends ...
  */
  if (Array.isArray(info.extendedTypes) && info.extendedTypes.length > 0) {
    let firstExtended = info.extendedTypes[0];
    /**
    * import Helper from '@ember/component/helper';
    *
    * export class MyHelper extends Helper<{...}>
    */
    if (firstExtended?.type === 'reference' && firstExtended.package === 'ember-source' && firstExtended.qualifiedName.includes('/helper') && Array.isArray(firstExtended.typeArguments) && firstExtended.typeArguments[0] && 'declaration' in firstExtended.typeArguments[0]) {
      return firstExtended.typeArguments[0].declaration;
    }
  }
  /**
  * export function(...): return;
  */
  if (info.signatures) {
    return info.signatures;
  }
  /**
  * export interface Signature { ... }
  */
  return info;
}
function getReturn(info) {
  if (info.variant === 'signature') {
    return info.type;
  }
  if (Array.isArray(info)) {
    return info.find(item => item.name === 'Return')?.type;
  }
  if ('children' in info) {
    return getReturn(info.children);
  }
}
const Return = setComponentTemplate(precompileTemplate("\n  {{#if @info}}\n    <div class=\"typedoc__helper__return\">\n      <h3 class=\"typedoc__heading\">Return</h3>\n\n      <Type @info={{@info}} />\n    </div>\n  {{/if}}\n", {
  strictMode: true,
  scope: () => ({
    Type
  })
}), templateOnly());
const HelperSignature = setComponentTemplate(precompileTemplate("\n  <Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration|>\n    {{#let (getSignature declaration) as |info|}}\n      {{#if (globalThis.Array.isArray info)}}\n        {{#each info as |signature|}}\n          <Args @kind=\"helper\" @info={{getArgs signature}} />\n          <Return @info={{getReturn signature}} />\n        {{/each}}\n      {{else}}\n        {{!-- Whenever we have a \"Full Signature\" or \"HelperLike\" definition --}}\n        <Args @kind=\"helper\" @info={{getArgs info}} />\n        <Return @info={{getReturn info}} />\n      {{/if}}\n\n    {{/let}}\n  </Load>\n", {
  strictMode: true,
  scope: () => ({
    Load,
    getSignature,
    globalThis,
    Args,
    getArgs,
    Return,
    getReturn
  })
}), templateOnly());

export { HelperSignature };
//# sourceMappingURL=helper.js.map
