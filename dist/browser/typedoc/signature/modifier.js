
import { Load, findChildDeclaration } from '../utils.js';
import { Args } from './args.js';
import { Element } from './element.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

/** eslint-disable @typescript-eslint/no-unused-vars */
function getSignatureType(info, _project) {
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
  */ // TODO: need to add ember-modifier's types to the typedoc generator
  /**
  * (implicit signature)
  *
  * import { modifier } from 'ember-modifier';
  *
  * export const foo = modifier(() => {});
  */
  if (info.type && 'package' in info.type) {
    if (info.type.package === 'ember-modifier') ;
    /**
    * import type { ModifierLike } from '@glint/template';
    *
    * export const X: ModifierLike<{ ... }>
    */
    if (info.type?.package === 'kolay' && info.type.symbolId?.packagePath?.includes('fake-glint-template.d.ts') && Array.isArray(info.type?.typeArguments) && info.type.typeArguments.length > 0) {
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
function getSignature(info, project) {
  const type = getSignatureType(info);
  if (!type) {
    console.warn('Could not finde signature');
    return;
  }
  return {
    Element: findChildDeclaration(type, 'Element'),
    Args: findChildDeclaration(type, 'Args')
  };
}
const ModifierSignature = setComponentTemplate(precompileTemplate("\n  <Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration project|>\n    {{#let (getSignature declaration project) as |info|}}\n      <Element @kind=\"modifier\" @info={{info.Element}} />\n      <Args @kind=\"modifier\" @info={{info.Args}} />\n    {{/let}}\n  </Load>\n", {
  strictMode: true,
  scope: () => ({
    Load,
    getSignature,
    Element,
    Args
  })
}), templateOnly());

export { ModifierSignature };
//# sourceMappingURL=modifier.js.map
