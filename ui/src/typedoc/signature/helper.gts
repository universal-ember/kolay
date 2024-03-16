import { Type } from '../renderer.gts';
import { Load } from '../utils.gts';
import { getNamedArgs, getPositionalArgs, NamedArgs } from './args.gts';

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
    return info.type.typeArguments[0]?.declaration;
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

function getArgs(info: any) {
  if (Array.isArray(info)) {
    return info.find(item => item.name === 'Args');
  }

  if ('children' in info) {
    return getArgs(info.children);
  }
}

function getReturn(info: any) {
  if (Array.isArray(info)) {
    return info.find(item => item.name === 'Return')?.type;
  }

  if ('children' in info) {
    return getReturn(info.children);
  }
}

const Return: TOC<{ Args: { info: any }}> = <template>
  {{#if @info}}
    <h3 class='typedoc-heading'>Return</h3>

    <Type @info={{@info}} />
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
    {{log 'hepler' declaration}}
    {{#let (getSignature declaration) as |info|}}
      {{#if (Array.isArray info)}}
        {{#each info as |signature|}}
          {{! TODO: have special formatting for parameters vs return type }}
        {{! @glint-expect-error }}
          <Type @info={{signature}} />
        {{/each}}
      {{else}}
        {{! Whenever we have a "Full Signature" or "HelperLike" definition }}
        {{#let (getArgs info) (getReturn info) as |args returnType|}}
          <NamedArgs @kind='modifier' @info={{getPositionalArgs args}} />
          <NamedArgs @kind='modifier' @info={{getNamedArgs args}} />
          <Return @info={{returnType}} />
        {{/let}}
      {{/if}}

    {{/let}}
  </Load>
</template>;
