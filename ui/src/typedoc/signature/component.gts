import { ExternalLink } from 'ember-primitives/components/external-link';

import { Comment, isIntrinsic, Type } from '../renderer.gts';
import { findChildDeclaration, Load } from '../utils.gts';

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
    }
  }

  /**
   * export interface Signature { ... }
   */
  return info;
}

const not = (x: unknown) => !x;

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
    as |declaration|
  >
    {{#let (getSignature declaration) as |info|}}
      <Element @info={{findChildDeclaration info 'Element'}} />
      <Args @info={{findChildDeclaration info 'Args'}} />
      <Blocks @info={{findChildDeclaration info 'Blocks'}} />
    {{/let}}
  </Load>
</template>;

const Args: TOC<{ Args: { info: any } }> = <template>
  {{#if @info}}
    <h3 class='typedoc-heading'>Arguments</h3>
    {{#each @info.type.declaration.children as |child|}}
      <span class='typedoc-component-arg'>
        <span class='typedoc-component-arg-info'>
          <pre class='typedoc-name'>@{{child.name}}</pre>
          {{#if (isIntrinsic child.type)}}
            <Type @info={{child.type}} />
          {{/if}}
        </span>
        {{#if (not (isIntrinsic child.type))}}
          <Type @info={{child.type}} />
        {{else}}
          <Comment @info={{child}} />
        {{/if}}
      </span>
    {{/each}}
  {{/if}}
</template>;

const mdnElement = (typeName: string) => {
  let element = typeName
    .replace('HTML', '')
    .replace('Element', '')
    .toLowerCase();

  return `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${element}`;
};

const Element: TOC<{ Args: { info: any } }> = <template>
  {{#if @info}}
    <h3 class='typedoc-heading typedoc__component-signature__element-header'>
      <span class='typedoc__name'>{{@info.name}}</span>
      <span class='typedoc__component-signature__element-type'>
        <ExternalLink
          href={{mdnElement @info.type.name}}
          class='typedoc__type-link'
        >
          {{@info.type.name}}
          ➚
        </ExternalLink>
      </span>
    </h3>
    <span class='typedoc__component-signature__element'>
      <Comment @info={{@info}} />
    </span>
  {{/if}}
</template>;
const Blocks: TOC<{ Args: { info: any } }> = <template>
  {{#if @info}}
    <h3 class='typedoc-heading'>Blocks</h3>
    {{#each @info.type.declaration.children as |child|}}
      <span class='typedoc__component-signature__block'>
        <pre class='typedoc__name'>&lt;:{{child.name}}&gt;</pre>
        {{! <span class='typedoc-category'>Properties </span> }}
        <div class='typedoc-property'>
          <Type @info={{child.type}} />
          <Comment @info={{child}} />
        </div>
      </span>
    {{/each}}
  {{/if}}
</template>;
