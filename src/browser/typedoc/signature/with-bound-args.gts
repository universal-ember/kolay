import Component from '@glimmer/component';

import { isKindWrapper, Kind, type Kind as KindName, kindOf } from '../kind.gts';
import { isLiteral, isReference } from '../narrowing.ts';
import { Type } from '../renderer.gts';
import { Args, listifyArgs } from './args.gts';
import {
  ComponentDeclaration,
  getSignature,
  isUnionSignature,
  type SignatureResult,
  type SingleSignature,
} from './component.gts';
import { Element } from './element.gts';
import { Return } from './helper.gts';

import type { ProjectReflection, ReferenceType, Reflection, SomeType } from 'typedoc';

/**
 * `WithBoundArgs<typeof Foo, 'a' | 'b'>` describes what is left of `Foo` after
 * `a` and `b` have already been passed -- so the type names the args that a
 * consumer *cannot* pass. That's the inverse of what a docs reader wants to
 * know, and the `WithBoundArgs<...>` wrapper itself is a Glint implementation
 * detail.
 *
 * So, rather than render the type as authored, we render `Foo` with its
 * signature -- minus the bound args, which are no longer the reader's to pass.
 */
export function isWithBoundArgs(type: SomeType | undefined): type is ReferenceType {
  return isReference(type) && type.name === 'WithBoundArgs';
}

/**
 * Both `typeof Foo` (a query) and `Foo` (a reference -- a `ComponentLike`
 * alias, for example) name the component being bound.
 */
function componentType(type: SomeType | undefined): SomeType | undefined {
  return type?.type === 'query' ? type.queryType : type;
}

/**
 * The bound arg names -- either a lone `'foo'`, or a union: `'foo' | 'bar'`.
 */
function boundArgNames(type: SomeType | undefined): string[] {
  if (!type) return [];

  if (isLiteral(type)) {
    return typeof type.value === 'string' ? [type.value] : [];
  }

  if (type.type === 'union') {
    return type.types.flatMap(boundArgNames);
  }

  return [];
}

/**
 * A component's args are the direct children of `Args`. A modifier's or
 * helper's named args live one level down, under `Named` -- and those are
 * what `WithBoundArgs` binds, so they have to be reachable by name too.
 */
function namedArgs(arg: any): any[] {
  if (arg?.name !== 'Named') return [arg];

  return arg.type?.declaration?.children ?? [arg];
}

function omitArgs(signature: SingleSignature, bound: Set<string>): SingleSignature {
  if (!signature.Args) return signature;

  return {
    ...signature,
    Args: listifyArgs(signature.Args)
      .flatMap(namedArgs)
      .filter((arg) => !bound.has(arg?.name)),
  };
}

/**
 * `typeof foo`, where `foo` is typed as `ModifierLike<{...}>` (or any other
 * `*Like`), reaches us as the wrapper rather than as a reference to `foo` --
 * the signature is the wrapper's type argument.
 */
function wrappedSignature(type: ReferenceType): Reflection | undefined {
  if (!isKindWrapper(type.name)) return;

  const arg = type.typeArguments?.[0];

  if (!arg) return;

  if (arg.type === 'reflection') return arg.declaration;

  if (isReference(arg)) return arg.reflection;

  return;
}

/**
 * What a `WithBoundArgs<...>` binds args to: the reference as written, and
 * the declaration holding its signature -- which is missing when the target
 * isn't part of the generated docs (not exported, or from a package that
 * isn't documented).
 */
export function boundComponent(info: ReferenceType) {
  const type = componentType(info.typeArguments?.[0]);

  if (!isReference(type)) return;

  return {
    type,
    /**
     * A wrapper has no name worth rendering -- its kind label stands in.
     */
    isWrapper: isKindWrapper(type.name),
    reflection: type.reflection ?? wrappedSignature(type),
  };
}

/**
 * The signature of the bound component, without the args already bound.
 */
export function boundArgsSignature(
  info: ReferenceType,
  project: ProjectReflection
): SignatureResult | undefined {
  const component = boundComponent(info);

  if (!component?.reflection) return;

  const signature = getSignature(component.reflection, project);

  if (!signature) return;

  const omitted = new Set(boundArgNames(info.typeArguments?.[1]));

  if (isUnionSignature(signature)) {
    return { variants: signature.variants.map((variant) => omitArgs(variant, omitted)) };
  }

  return omitArgs(signature, omitted);
}

/**
 * One signature per union variant, so both shapes render the same way.
 */
function variantsOf(signature: SignatureResult | undefined): SingleSignature[] {
  if (!signature) return [];

  if (isUnionSignature(signature)) return signature.variants;

  return [signature];
}

export class WithBoundArgs extends Component<{
  Args: { info: ReferenceType; project: ProjectReflection };
}> {
  /**
   * Marks where we are in the document so that we can tell whether one of our
   * own ancestors is already rendering this same component -- components may
   * yield a bound copy of themselves, and expanding that forever would hang
   * the page.
   */
  anchor = document.createTextNode('');

  get #component() {
    return boundComponent(this.args.info);
  }

  get componentType() {
    return this.#component?.type;
  }

  get id() {
    return this.#component?.reflection?.id;
  }

  /**
   * A named target (a class, or an alias for one) is worth naming. A `*Like`
   * wrapper isn't -- and rendering it would render its signature a second
   * time, as its type argument.
   */
  get named() {
    if (this.#component?.isWrapper) return;

    return this.componentType;
  }

  get #isRecursive() {
    if (this.id === undefined) return false;

    // `closest` is optional-called for non-browser DOMs (FastBoot), where
    // there's nothing to walk up
    return Boolean(this.anchor.parentElement?.closest?.(`[data-typedoc-expanded~="${this.id}"]`));
  }

  get variants() {
    if (this.#isRecursive) return [];

    return variantsOf(boundArgsSignature(this.args.info, this.args.project));
  }

  /**
   * `WithBoundArgs` binds modifiers and helpers too, and their signatures are
   * rendered differently from a component's.
   */
  get kind() {
    return kindOf(this.componentType) ?? 'component';
  }

  <template>
    {{this.anchor}}

    {{#if this.named}}
      <Type @info={{this.named}} />
    {{else}}
      <Kind @kind={{this.kind}} />
    {{/if}}

    {{#each this.variants as |variant|}}
      <span class='typedoc__nested-signature' data-typedoc-expanded={{this.id}}>
        {{#if (is this.kind 'modifier')}}
          <Element @kind='modifier' @info={{variant.Element}} />
          <Args @kind='modifier' @info={{variant.Args}} />
        {{else if (is this.kind 'helper')}}
          <Args @kind='helper' @info={{variant.Args}} />
          <Return @info={{variant.Return.type}} />
        {{else}}
          <ComponentDeclaration @signature={{variant}} />
        {{/if}}
      </span>
    {{/each}}
  </template>
}

const is = (kind: KindName, expected: KindName) => kind === expected;
