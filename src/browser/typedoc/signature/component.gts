import { isReference } from '../narrowing.ts';
import { Comment, Type } from '../renderer.gts';
import { findChildDeclaration, Load } from '../utils.gts';
import { Args } from './args.gts';
import { Element } from './element.gts';

import type { TOC } from '@ember/component/template-only';
import type { ProjectReflection, Reflection } from 'typedoc';

function getSignatureType(info: Reflection, project: ProjectReflection) {
  /**
   * export const Foo: TOC<{ signature here }> = <template> ... </template>
   */
  if (info.isDeclaration()) {
    if (isReference(info.type) && info.type?.typeArguments?.[0]?.type === 'reflection') {
      return info.type.typeArguments[0].declaration;
    }

    /**
     * export class Foo extends Component<{ signature here }> { ... }
     */
    const extendedType = info.extendedTypes?.[0];

    if (extendedType?.type === 'reference' && extendedType?.package === '@glimmer/component') {
      const typeArg = extendedType.typeArguments?.[0];

      if (typeArg) {
        if (typeArg?.type === 'reflection') {
          return typeArg.declaration;
        }

        /**
         * export interface Signature { ... }
         *
         * export class Foo extends Component<Signature>
         */
        if ('_target' in typeArg) {
          const id = (typeArg as any)._target;

          return project.getReflectionById(id);
        }
      }
    }

    /**
     * export interface Signature { ... }
     * export const Foo: TOC<Signature> = <template> ... </template>
     */
    if (info.type?.type === 'reference') {
      const typeArg = info.type?.typeArguments?.[0];

      if (typeArg && '_target' in typeArg) {
        const id = (typeArg as any)._target;

        return project.getReflectionById(id);
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
  <Load @package={{@package}} @module={{@module}} @name={{@name}} as |declaration project|>
    {{#let (getSignature declaration project) as |info|}}
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
