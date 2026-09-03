import { Heading } from 'ember-primitives/components/heading';

import { isReference } from '../narrowing.ts';
import { Comment, Type } from '../renderer.gts';
import { findChildDeclaration, Load } from '../utils.gts';
import { Args } from './args.gts';
import { Element } from './element.gts';

import type { TOC } from '@ember/component/template-only';
import type { ProjectReflection, Reflection, SomeType } from 'typedoc';

export type SingleSignature = { Element: any; Args: any; Blocks: any; Return: any };
export type UnionSignature = { variants: SingleSignature[] };
export type SignatureResult = SingleSignature | UnionSignature;

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

function getSignatureFromType(type: Reflection): SingleSignature | undefined {
  const Element = findChildDeclaration(type, 'Element');
  const Args = findChildDeclaration(type, 'Args');
  const Blocks = findChildDeclaration(type, 'Blocks');
  // components don't have one -- helpers, which share this shape, do
  const Return = findChildDeclaration(type, 'Return');

  const hasAny = Element || Args || Blocks || Return;

  if (!hasAny) return;

  return { Element, Args, Blocks, Return };
}

export function getSignature(
  info: Reflection | undefined,
  project: ProjectReflection
): SignatureResult | undefined {
  if (!info) return;

  const type = getSignatureType(info, project);

  if (!type) return;

  /**
   * Union type signatures, e.g.:
   *   export type Signature = { Element: ...; Args: { a: string } } | { Element: ...; Args: { b: number } }
   *
   * Each member of the union is a separate signature variant.
   */
  if (type.isDeclaration() && type.type?.type === 'union' && type.type.types) {
    const variants = type.type.types
      .map((unionMember: SomeType) => {
        if (
          unionMember.type === 'reflection' &&
          'declaration' in unionMember &&
          unionMember.declaration
        ) {
          return getSignatureFromType(unionMember.declaration);
        }

        return undefined;
      })
      .filter((v): v is SingleSignature => v !== undefined);

    if (variants.length > 0) {
      return { variants };
    }
  }

  return getSignatureFromType(type);
}

export function isUnionSignature(info: SignatureResult | undefined): info is UnionSignature {
  return info !== undefined && 'variants' in info;
}

/**
 * The declaration a signature is read from. Different types can lead to the
 * same one -- `SignatureC`, `ComponentLike<SignatureC>`, and
 * `WithBoundArgs<ClassC, ...>` all do -- which is what makes it usable as the
 * identity of a signature, for spotting one that refers back to itself.
 */
export function signatureSource(
  info: Reflection | undefined,
  project: ProjectReflection
): Reflection | undefined {
  if (!info) return;

  return getSignatureType(info, project) ?? undefined;
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
    {{#let
      (getSignature declaration project) (signatureSource declaration project)
      as |info source|
    }}
      {{!
        Marks the signature being documented, so that a type further down
        that leads back to it renders as a reference to what is already on
        the page, rather than repeating it.
      }}
      <div class='typedoc__signature-root' data-typedoc-signature={{source.id}}>
        {{#if (isUnionSignature info)}}
          {{#each info.variants as |variant|}}
            <div class='typedoc__union-variant'>
              <ComponentDeclaration @signature={{variant}} />
            </div>
          {{/each}}
        {{else if info}}
          <ComponentDeclaration @signature={{info}} />
        {{/if}}
      </div>
    {{/let}}
  </Load>
</template>;

export const ComponentDeclaration: TOC<{
  Args: {
    signature: SingleSignature;
  };
}> = <template>
  <Element @kind='component' @info={{@signature.Element}} />
  <Args @kind='component' @info={{@signature.Args}} />
  <Blocks @info={{@signature.Blocks}} />
</template>;

const Blocks: TOC<{ Args: { info: any } }> = <template>
  {{#if @info}}
    <section>
      <Heading class='typedoc__heading'>Blocks</Heading>
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
    </section>
  {{/if}}
</template>;
