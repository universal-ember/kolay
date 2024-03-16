import { findChildDeclaration, Load } from '../utils.gts';
import { getNamedArgs, NamedArgs } from './args.gts';
import { Element } from './element.gts';

import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection } from 'typedoc';

function getSignature(info: DeclarationReflection) {
  /**
   * export const Foo: TOC<{ signature here }> = <template> ... </template>
   */
  if (
    info.type?.type === 'reference' &&
    info.type?.typeArguments?.[0]?.type === 'reflection'
  ) {
    return info.type.typeArguments[0].declaration;
  }

  /**
   * export const foo = modifier<Signature>(() => {});
   */
  if (info.variant === 'declaration' && 'extendedTypes' in info) {
    let extendedType = info.extendedTypes?.[0];

    if (
      extendedType?.type === 'reference' &&
      extendedType?.package === 'ember-modifier'
    ) {
      let typeArg = extendedType.typeArguments?.[0];

      if (typeArg?.type === 'reflection') {
        return typeArg.declaration;
      }
    }
  }

  /**
   * export interface Signature { ... }
   */
  return info;
}

export const ModifierSignature: TOC<{
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
    {{log 'modifier' declaration}}
    {{#let (getSignature declaration) as |info|}}
      <Element @kind='modifier' @info={{findChildDeclaration info 'Element'}} />
      <NamedArgs @kind='modifier' @info={{getNamedArgs info}} />
    {{/let}}
  </Load>
</template>;
