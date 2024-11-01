import { Type } from '../renderer.gts';
import { Load } from '../utils.gts';
import { Args, getArgs } from './args.gts';

import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection } from 'typedoc';

function getSignature(info: DeclarationReflection) {
  /**
   * export const Foo: HelperLike<{...}>
   */
  if (
    info.variant === 'declaration' &&
    info.type?.type === 'reference' &&
    info.type?.package === '@glint/template' &&
    info.type?.name === 'HelperLike' &&
    Array.isArray(info.type?.typeArguments) &&
    info.type.typeArguments[0] &&
    'declaration' in info.type.typeArguments[0]
  ) {
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
    if (
      firstExtended?.type === 'reference' &&
      firstExtended.package === 'ember-source' &&
      firstExtended.qualifiedName.includes('/helper') &&
      Array.isArray(firstExtended.typeArguments) &&
      firstExtended.typeArguments[0] &&
      'declaration' in firstExtended.typeArguments[0]
    ) {
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

function getReturn(info: any) {
  if (info.variant === 'signature') {
    return info.type;
  }

  if (Array.isArray(info)) {
    return info.find((item) => item.name === 'Return')?.type;
  }

  if ('children' in info) {
    return getReturn(info.children);
  }
}

const Return: TOC<{ Args: { info: any } }> = <template>
  {{#if @info}}
    <div class='typedoc__helper__return'>
      <h3 class='typedoc__heading'>Return</h3>

      <Type @info={{@info}} />
    </div>
  {{/if}}
</template>;

export const HelperSignature: TOC<{
  Args: {
    /**
     * Which module to import the type from
     */
    module: string;
    /**
     * The name of the component to render the type / JSDoc of
     */
    name: string;
    /**
     * The name of the package to lookup the module and export name.
     */
    package: string;
  };
}> = <template>
  <Load
    @package={{@package}}
    @module={{@module}}
    @name={{@name}}
    as |declaration|
  >
    {{#let (getSignature declaration) as |info|}}
      {{#if (globalThis.Array.isArray info)}}
        {{#each info as |signature|}}
          <Args @kind='helper' @info={{getArgs signature}} />
          <Return @info={{getReturn signature}} />
        {{/each}}
      {{else}}
        {{! Whenever we have a "Full Signature" or "HelperLike" definition }}
        <Args @kind='helper' @info={{getArgs info}} />
        <Return @info={{getReturn info}} />
      {{/if}}

    {{/let}}
  </Load>
</template>;
