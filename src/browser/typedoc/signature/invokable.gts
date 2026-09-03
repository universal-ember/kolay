import Component from '@glimmer/component';

import { isKindWrapper, Kind, type Kind as KindName, kindOf } from '../kind.gts';
import { isLiteral, isReference } from '../narrowing.ts';
import { Args, listifyArgs } from './args.gts';
import {
  ComponentDeclaration,
  getSignature,
  isUnionSignature,
  type SignatureResult,
  signatureSource,
  type SingleSignature,
} from './component.gts';
import { Element } from './element.gts';
import { Return } from './helper.gts';

import type { TOC } from '@ember/component/template-only';
import type { ProjectReflection, ReferenceType, Reflection, SomeType } from 'typedoc';

/**
 * A type that can be invoked from a template -- a component, a modifier, or a
 * helper -- rendered as its signature, rather than as the type expression
 * that describes it.
 *
 * The type expressions are Glint plumbing: `ComponentLike<Signature>` says
 * "component", and `WithBoundArgs<typeof Foo, 'a' | 'b'>` says "what's left
 * of Foo once `a` and `b` have been passed" -- naming the args a consumer
 * *cannot* pass, the inverse of what a reader needs. Both render as the
 * signature that is actually being handed over.
 */
export function isWithBoundArgs(type: SomeType | undefined): type is ReferenceType {
  return isReference(type) && type.name === 'WithBoundArgs';
}

export function isInvokable(type: SomeType | undefined): type is ReferenceType {
  if (!isReference(type)) return false;

  return isWithBoundArgs(type) || kindOf(type) !== undefined;
}

/**
 * Both `typeof Foo` (a query) and `Foo` (a reference) name the same thing.
 */
function targetType(type: SomeType | undefined): SomeType | undefined {
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
  if (!signature.Args || bound.size === 0) return signature;

  return {
    ...signature,
    Args: listifyArgs(signature.Args)
      .flatMap(namedArgs)
      .filter((arg) => !bound.has(arg?.name)),
  };
}

/**
 * A wrapper -- `ComponentLike<Signature>`, `ModifierLike<{...}>` -- holds the
 * signature as its type argument. `typeof foo`, where `foo` is *typed* as one
 * of those, reaches us the same way.
 */
function wrappedSignature(type: ReferenceType): Reflection | undefined {
  if (!isKindWrapper(type.name)) return;

  const arg = type.typeArguments?.[0];

  if (!arg) return;

  if (arg.type === 'reflection') return arg.declaration;

  if (isReference(arg)) return arg.reflection;

  return;
}

function variantsOf(signature: SignatureResult | undefined): SingleSignature[] {
  if (!signature) return [];

  if (isUnionSignature(signature)) return signature.variants;

  return [signature];
}

interface Invoked {
  /**
   * What it is, when we can tell. Also picks the shape it renders in.
   */
  kind: KindName | undefined;
  /**
   * The reference to render a name for -- absent for a wrapper, whose name
   * is plumbing that the kind label replaces.
   */
  named: ReferenceType | undefined;
  /**
   * The declaration the signature came from. Two types that resolve to the
   * same one are the same signature, which is how self-reference is spotted.
   */
  source: Reflection | undefined;
  variants: SingleSignature[];
}

export function invoked(info: ReferenceType, project: ProjectReflection): Invoked {
  const bound = isWithBoundArgs(info);
  const target = bound ? targetType(info.typeArguments?.[0]) : info;

  if (!isReference(target)) {
    return { kind: undefined, named: undefined, source: undefined, variants: [] };
  }

  const kind = kindOf(target);
  const named = isKindWrapper(target.name) ? undefined : target;
  const reflection = target.reflection ?? wrappedSignature(target);

  if (!reflection) {
    return { kind, named, source: undefined, variants: [] };
  }

  const omitted = new Set(bound ? boundArgNames(info.typeArguments?.[1]) : []);

  return {
    kind,
    named,
    source: signatureSource(reflection, project),
    variants: variantsOf(getSignature(reflection, project)).map((variant) =>
      omitArgs(variant, omitted)
    ),
  };
}

export class Invokable extends Component<{
  Args: { info: ReferenceType; project: ProjectReflection };
}> {
  /**
   * Marks where we are in the document, so that we can tell whether this same
   * signature is already being rendered further up. Components hand back
   * bound copies of themselves and of each other, and expanding those forever
   * would hang the page -- and repeat what the reader has already read.
   */
  anchor = document.createTextNode('');

  get #invoked() {
    return invoked(this.args.info, this.args.project);
  }

  get named() {
    return this.#invoked.named;
  }

  get kind() {
    return this.#invoked.kind;
  }

  /**
   * Components render Element/Args/Blocks; the other two don't.
   */
  get shape() {
    return this.#invoked.kind ?? 'component';
  }

  get id() {
    return this.#invoked.source?.id;
  }

  /**
   * `closest` is optional-called throughout, for non-browser DOMs (FastBoot),
   * where there is nothing to walk up.
   */
  get #ancestor() {
    return this.anchor.parentElement;
  }

  /**
   * The same signature is already being rendered further up.
   */
  get isRecursive() {
    if (this.id === undefined) return false;

    return Boolean(this.#ancestor?.closest?.(`[data-typedoc-signature~="${this.id}"]`));
  }

  /**
   * One level of expansion answers "what am I being handed?". A second level
   * answers a question the reader didn't ask, and turns the page into a wall
   * -- what's yielded by what's yielded is a page of its own.
   */
  get variants() {
    if (this.isRecursive) return [];

    if (this.#ancestor?.closest?.('[data-typedoc-nested]')) return [];

    return this.#invoked.variants;
  }

  <template>
    {{this.anchor}}

    {{#if this.variants.length}}
      {{!
        A whole signature is a lot to drop inline into a list of yielded
        things, so it opens on demand -- the summary says what it is, which
        is what most readers are here for.
      }}
      {{#each this.variants as |variant|}}
        <details
          class='typedoc__nested-signature'
          data-typedoc-signature={{this.id}}
          data-typedoc-nested
        >
          <summary class='typedoc__nested-signature__summary'>
            <Label @named={{this.named}} @kind={{this.kind}} />
          </summary>
          <div class='typedoc__nested-signature__body'>
            {{#if (is this.shape 'modifier')}}
              <Element @kind='modifier' @info={{variant.Element}} />
              <Args @kind='modifier' @info={{variant.Args}} />
            {{else if (is this.shape 'helper')}}
              <Args @kind='helper' @info={{variant.Args}} />
              <Return @info={{variant.Return.type}} />
            {{else}}
              <ComponentDeclaration @signature={{variant}} />
            {{/if}}
          </div>
        </details>
      {{/each}}
    {{else}}
      <span class='typedoc__invokable'>
        <Label @named={{this.named}} @kind={{this.kind}} />

        {{#if this.isRecursive}}
          {{! it is rendered in full further up -- saying so beats repeating it }}
          <span class='typedoc__recursive' title='Already rendered above'>recursive</span>
        {{/if}}
      </span>
    {{/if}}
  </template>
}

const Label: TOC<{
  Args: { named: ReferenceType | undefined; kind: KindName | undefined };
}> = <template>
  <span class='typedoc__reference'>
    {{#if @named}}
      <span class='typedoc__reference__name'>{{nameOf @named}}</span>
    {{/if}}
    {{#if @kind}}
      <Kind @kind={{@kind}} />
    {{/if}}
  </span>
</template>;

const is = (kind: KindName, expected: KindName) => kind === expected;
const nameOf = (type: ReferenceType) => type.reflection?.name ?? type.name;
