import Component from '@glimmer/component';

import { isLiteral, isReference } from '../narrowing.ts';
import { Type } from '../renderer.gts';
import { listifyArgs } from './args.gts';
import {
  ComponentDeclaration,
  getSignature,
  isUnionSignature,
  type SignatureResult,
  type SingleSignature,
} from './component.gts';

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

function omitArgs(signature: SingleSignature, bound: Set<string>): SingleSignature {
  if (!signature.Args) return signature;

  return {
    ...signature,
    Args: listifyArgs(signature.Args).filter((arg) => !bound.has(arg?.name)),
  };
}

/**
 * The component a `WithBoundArgs<...>` binds args to, if it is part of the
 * generated docs. Components that aren't (not exported, or from a package
 * that isn't documented) have no signature to render.
 */
export function boundComponent(
  info: ReferenceType
): { type: SomeType; reflection: Reflection | undefined } | undefined {
  const type = componentType(info.typeArguments?.[0]);

  if (!isReference(type)) return;

  return { type, reflection: type.reflection };
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

  <template>
    {{this.anchor}}

    {{#if this.componentType}}
      <Type @info={{this.componentType}} />
    {{/if}}

    {{#each this.variants as |variant|}}
      <span class='typedoc__nested-signature' data-typedoc-expanded={{this.id}}>
        <ComponentDeclaration @signature={{variant}} />
      </span>
    {{/each}}
  </template>
}
