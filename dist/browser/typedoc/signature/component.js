import { Comment, Type } from '../renderer.js';
import { Load, findChildDeclaration } from '../utils.js';
import { Args } from './args.js';
import { Element } from './element.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

function findReferenceByFilename(name, fileName, info) {
  if (!info.children) return;
  for (const child of info.children) {
    if (child.sources[0].fileName === fileName) {
      return child;
    }
    if (!child.children) continue;
    const isRelevant = child.children.find(grandChild => grandChild.sources[0].fileName === fileName);
    if (isRelevant) {
      return isRelevant;
    }
    const grand = findReferenceByFilename(name, fileName, child);
    if (grand) return grand;
  }
}
function getSignatureType(info, doc) {
  /**
  * export const Foo: TOC<{ signature here }> = <template> ... </template>
  */
  if (info.type?.type === 'reference' && info.type?.typeArguments?.[0]?.type === 'reflection') {
    return info.type.typeArguments[0].declaration;
  }
  /**
  * export class Foo extends Component<{ signature here }> { ... }
  */
  if (info.variant === 'declaration' && 'extendedTypes' in info) {
    const extendedType = info.extendedTypes?.[0];
    if (extendedType?.type === 'reference' && extendedType?.package === '@glimmer/component') {
      const typeArg = extendedType.typeArguments?.[0];
      if (typeArg?.type === 'reflection') {
        return typeArg.declaration;
      }
      if (typeArg?.type === 'reference') {
        if ('symbolIdMap' in doc) {
          // This is hard, maybe typedoc has a util?
          return findReferenceByFilename(typeArg.name, extendedType.target.sourceFileName, doc);
        }
      }
    }
  }
  /**
  * export interface Signature { ... }
  */
  return info;
}
function getSignature(info, doc) {
  const type = getSignatureType(info, doc);
  if (!type) {
    console.warn('Could not finde signature');
    return;
  }
  return {
    Element: findChildDeclaration(type, 'Element'),
    Args: findChildDeclaration(type, 'Args'),
    Blocks: findChildDeclaration(type, 'Blocks')
  };
}
const ComponentSignature = setComponentTemplate(precompileTemplate("\n  <Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration doc|>\n    {{#let (getSignature declaration doc) as |info|}}\n      <Element @kind=\"component\" @info={{info.Element}} />\n      <Args @kind=\"component\" @info={{info.Args}} />\n      <Blocks @info={{info.Blocks}} />\n    {{/let}}\n  </Load>\n", {
  strictMode: true,
  scope: () => ({
    Load,
    getSignature,
    Element,
    Args,
    Blocks
  })
}), templateOnly());
const Blocks = setComponentTemplate(precompileTemplate("\n  {{#if @info}}\n    <h3 class=\"typedoc__heading\">Blocks</h3>\n    {{#each @info.type.declaration.children as |child|}}\n      <span class=\"typedoc__component-signature__block\">\n        <pre class=\"typedoc__name\">&lt;:{{child.name}}&gt;</pre>\n        {{!-- <span class='typedoc-category'>Properties </span> --}}\n        <div class=\"typedoc__property\">\n          <Type @info={{child.type}} />\n          <Comment @info={{child}} />\n        </div>\n      </span>\n    {{/each}}\n  {{/if}}\n", {
  strictMode: true,
  scope: () => ({
    Type,
    Comment
  })
}), templateOnly());

export { ComponentSignature };
//# sourceMappingURL=component.js.map
