import { Comment, Type } from '../renderer.gts';
import { findChildDeclaration, Load } from '../utils.gts';
import { Args } from './args.gts';
import { Element } from './element.gts';

import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection } from 'typedoc';

// function lookupReference(reference: any, info: any) {
//   let id = reference.target;
//   let lookup = info.symbolIdMap[id];

//   let fileName = lookup?.sourceFileName;
//   let name = lookup?.qualifiedName;

//   return findReferenceByFilename(name, fileName, info);
// }

function findReferenceByFilename(
  name: string,
  fileName: string,
  info: any,
): any {
  if (!info.children) return;

  for (let child of info.children) {
    if (child.sources[0].fileName === fileName) {
      return child;
    }

    if (!child.children) continue;

    let isRelevant = child.children.find(
      (grandChild: any) => grandChild.sources[0].fileName === fileName,
    );

    if (isRelevant) {
      return isRelevant;
    }

    let grand = findReferenceByFilename(name, fileName, child);

    if (grand) return grand;
  }
}

function getSignatureType(info: DeclarationReflection, doc: any) {
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
   * export class Foo extends Component<{ signature here }> { ... }
   */
  if (info.variant === 'declaration' && 'extendedTypes' in info) {
    let extendedType = info.extendedTypes?.[0];

    if (
      extendedType?.type === 'reference' &&
      extendedType?.package === '@glimmer/component'
    ) {
      let typeArg = extendedType.typeArguments?.[0];

      if (typeArg?.type === 'reflection') {
        return typeArg.declaration;
      }

      if (typeArg?.type === 'reference') {
        if ('symbolIdMap' in doc) {
          // This is hard, maybe typedoc has a util?
          return findReferenceByFilename(
            typeArg.name,
            (extendedType as any).target.sourceFileName,
            doc,
          );
        }
      }
    }
  }

  /**
   * export interface Signature { ... }
   */
  return info;
}

function getSignature(info: DeclarationReflection, doc: any) {
  let type = getSignatureType(info, doc);

  if (!type) {
    console.warn('Could not finde signature');

    return;
  }

  return {
    Element: findChildDeclaration(type, 'Element'),
    Args: findChildDeclaration(type, 'Args'),
    Blocks: findChildDeclaration(type, 'Blocks'),
  };
}

export const ComponentSignature: TOC<{
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
    as |declaration doc|
  >
    {{#let (getSignature declaration doc) as |info|}}
      <Element @kind='component' @info={{info.Element}} />
      <Args @kind='component' @info={{info.Args}} />
      <Blocks @info={{info.Blocks}} />
    {{/let}}
  </Load>
</template>;

const Blocks: TOC<{ Args: { info: any } }> = <template>
  {{#if @info}}
    <h3 class='typedoc__heading'>Blocks</h3>
    {{#each @info.type.declaration.children as |child|}}
      <span class='typedoc__component-signature__block'>
        <pre class='typedoc__name'>&lt;:{{child.name}}&gt;</pre>
        {{! <span class='typedoc-category'>Properties </span> }}
        <div class='typedoc__property'>
          <Type @info={{child.type}} />
          <Comment @info={{child}} />
        </div>
      </span>
    {{/each}}
  {{/if}}
</template>;
