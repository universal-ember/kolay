/** eslint-disable @typescript-eslint/no-unused-vars */
import { findChildDeclaration, Load } from '../utils.gts';
import { Args } from './args.gts';
import { Element } from './element.gts';

import type { TOC } from '@ember/component/template-only';
import type { ProjectReflection, Reflection } from 'typedoc';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSignatureType(info: Reflection, _project: ProjectReflection) {
  if (!info.isDeclaration()) {
    return info;
  }

  /**
   * export const Foo: TOC<{ signature here }> = <template> ... </template>
   */
  if (info.type?.type === 'reference' && info.type?.typeArguments?.[0]?.type === 'reflection') {
    return info.type.typeArguments[0].declaration;
  }

  /**
   * import { modifier } from 'ember-modifier';
   *
   * export const foo = modifier<{ ... }>(() => {});
   */
  // TODO: need to add ember-modifier's types to the typedoc generator

  /**
   * (implicit signature)
   *
   * import { modifier } from 'ember-modifier';
   *
   * export const foo = modifier(() => {});
   */
  if (info.type && 'package' in info.type) {
    if (info.type.package === 'ember-modifier') {
      // can't get at the inline signature here
    }

    /**
     * import type { ModifierLike } from '@glint/template';
     *
     * export const X: ModifierLike<{ ... }>
     */
    if (
      info.type?.package === 'kolay' &&
      info.type.symbolId?.packagePath?.includes('fake-glint-template.d.ts') &&
      Array.isArray(info.type?.typeArguments) &&
      info.type.typeArguments.length > 0
    ) {
      const typeArg = info.type?.typeArguments[0];

      if (typeArg && 'declaration' in typeArg) {
        return typeArg.declaration;
      }
    }
  }

  if (info.variant === 'declaration' && 'extendedTypes' in info) {
    const extendedType = info.extendedTypes?.[0];

    if (extendedType?.type === 'reference' && extendedType?.package === 'ember-modifier') {
      const typeArg = extendedType.typeArguments?.[0];

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

function getSignature(info: Reflection, project: ProjectReflection) {
  const type = getSignatureType(info, project);

  if (!type) {
    console.warn('Could not finde signature');

    return;
  }

  return {
    Element: findChildDeclaration(type, 'Element'),
    Args: findChildDeclaration(type, 'Args'),
  };
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
  <Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration project|>
    {{#let (getSignature declaration project) as |info|}}
      <Element @kind='modifier' @info={{info.Element}} />
      <Args @kind='modifier' @info={{info.Args}} />
    {{/let}}
  </Load>
</template>;
