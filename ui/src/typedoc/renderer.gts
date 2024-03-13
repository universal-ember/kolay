import { hash } from '@ember/helper';

import { Compiled } from '../services/kolay/compiler/reactive.ts';
import { Load } from './utils.gts';

import type { TOC } from '@ember/component/template-only';
import type {
  ArrayType,
  DeclarationReference,
  DeclarationReflection,
  LiteralType,
  NamedTupleMember,
  ReferenceType,
  SignatureReflection,
  SomeType,
  TupleType,
  UnionType,
  UnknownType,
} from 'typedoc';

/**
 * Assumptions:
 * - we are documenting public API
 *   - component properties and methods are not public API
 *     - including the constructor, inherited methods, etc
 *   - only the signature describes what the public API is.
 */
export const APIDocs: TOC<{
  Args: {
    /**
     * Which module to import the type from
     */
    module: string;
    /**
     * The name of the export to render the type / JSDoc of
     */
    name: string;
    /**
     * The name of the package to lookup the module and export name.
     */
    package: string;
  };
}> = <template>
  <Load @module={{@module}} @name='{{@name}}' @package={{@package}} as |info|>
    <Declaration @info={{info}} />
  </Load>
</template>;

/**
 * Used for referencing the comment on a const or class.
 *
 * For example:
 * ```
 * /*
 *  * Comment block here is what is targeted
 *  *\/
 * export const CommentQuery ...
 * ```
 *
 * Usage:
 * ```hbs
 * <CommentQuery @name="CommentQuery" ... />
 * ```
 */
export const CommentQuery: TOC<{
  Args: {
    /**
     * Which module to import the type from
     */
    module: string;
    /**
     * The name of the export to render the type / JSDoc of
     */
    name: string;
    /**
     * The name of the package to lookup the module and export name.
     */
    package: string;
  };
}> = <template>
  <Load @package={{@package}} @module={{@module}} @name={{@name}} as |info|>
    <Comment @info={{info}} />
  </Load>
</template>;

const join = (lines: string[]) => lines.join('\n');
const text = (lines: { text: string }[]) => lines.map((line) => line.text);

export function isGlimmerComponent(info: DeclarationReference) {
  let extended = (info as any)?.extendedTypes?.[0];

  if (!extended) return false;

  return (
    extended.name === 'default' && extended.package === '@glimmer/component'
  );
}

export const Comment: TOC<{
  Args: {
    info: {
      comment?: {
        summary?: { text: string }[];
      };
    };
  };
}> = <template>
  {{#if @info.comment.summary}}
    {{#let (Compiled (join (text @info.comment.summary))) as |compiled|}}
      {{#if compiled.isReady}}
        <div class='typedoc-rendered-comment'>
          <compiled.component />
        </div>
      {{/if}}
    {{/let}}
  {{/if}}
</template>;

const isIgnored = (name: string) =>
  ['__type', 'TOC', 'TemplateOnlyComponent'].includes(name);
const isConst = (x: { flags: { isConst: boolean } }) => x.flags.isConst;
const not = (x: unknown) => !x;

const Declaration: TOC<{
  Args: {
    info: DeclarationReflection | undefined;
  };
}> = <template>
  {{#if @info}}
    <div class='typedoc-declaration'>
      {{#if (not (isIgnored @info.name))}}
        <span class='typedoc-declaration-name'>{{@info.name}}</span>
      {{/if}}

      {{#if (isConst @info)}}
        <Comment @info={{@info}} />
      {{/if}}

      {{#if @info.type}}
        <Type @info={{@info.type}} />
      {{/if}}

      {{#if @info.children}}
        <ul class='typedoc-declaration-children'>
          {{#each @info.children as |child|}}
            <li><Declaration @info={{child}} /></li>
          {{/each}}
        </ul>
      {{/if}}

      {{#if @info.signatures}}
        <ul class='typedoc-declaration-signatures'>
          {{#each @info.signatures as |child|}}
            {{! @glint-expect-error }}
            <li><Type @info={{child}} /></li>
          {{/each}}
        </ul>
      {{/if}}

      {{#if (not (isConst @info))}}
        {{#if @info.comment.summary}}
          <Comment @info={{@info}} />
        {{/if}}
      {{/if}}
    </div>
  {{/if}}
</template>;

const Reflection: TOC<{ info: { declaration: DeclarationReflection } }> =
  <template><Declaration @info={{@info.declaration}} /></template>;

const isReference = (x: { type: string }) => x.type === 'reference';
const isReflection = (x: { type: string }) => x.type === 'reflection';

export const isIntrinsic = (x: { type: string }) => x.type === 'intrinsic';

const isTuple = (x: { type: string }) => x.type === 'tuple';
const isNamedTuple = (x: SomeType | undefined): x is NamedTupleMember =>
  x?.type === 'namedTupleMember';
const isVoidIntrinsic = (x: unknown | undefined) => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;

  if (typeof x.type === 'object' && x.type !== null) {
    if ('type' in x.type && 'name' in x.type) {
      return x.type.type === 'intrinsic' && x.type.name === 'void';
    }
  }

  return false;
};

const isArray = (x: SomeType | undefined): x is ArrayType => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;

  return x.type === 'array';
};

const isFn = (x: SomeType | undefined) => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('name' in x)) return false;
  if (!('variant' in x)) return false;

  return x.variant === 'signature';
};

const isUnknownType = (x: SomeType | undefined): x is UnknownType => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;

  return x.type === 'unknown';
};

const isUnion = (x: SomeType | undefined): x is UnionType => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;

  return x.type === 'union';
};
const isLiteral = (x: SomeType | undefined): x is UnionType => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  if (!('type' in x)) return false;

  return x.type === 'literal';
};

// function typeArg(info: DeclarationReference) {
//   let extended = info?.extendedTypes?.[0]

//   if (!extended) return false;

//   return extended.typeArguments[0]
// }
//
const isInvokable = (info: ReferenceType) => info.name === 'Invokable';

const Reference: TOC<{ info: ReferenceType }> = <template>
  {{#if (isInvokable @info)}}
    <div class='typedoc__unknown__yield'>
      <Intrinsic @info={{hash name='Component'}} />
    </div>
  {{else}}
    <div class='typedoc__reference'>
      {{#if (not (isIgnored @info.name))}}
        <div class='typedoc__reference__name'>{{@info.name}}</div>
      {{/if}}
      {{#if @info.typeArguments.length}}
        <div class='typedoc__reference__typeArguments'>
          &lt;
          {{#each @info.typeArguments as |typeArg|}}
            <div class='typedoc__reference__typeArgument'>
              <Type @info={{typeArg}} />
            </div>
          {{/each}}
          &gt;
        </div>
      {{/if}}
    </div>
  {{/if}}
</template>;

const Intrinsic: TOC<{ info: { name: string } }> = <template>
  <span class='typedoc-intrinsic'>{{@info.name}}</span>
</template>;

const VoidIntrinsic: TOC<{ info: { name: string } }> = <template>
  <div class='typedoc__void_intrinsic'>
    {{! @glint-expect-error }}
    <Function @info={{@info}} />
  </div>
</template>;

const Tuple: TOC<{ Args: { info: TupleType } }> = <template>
  {{#each @info.elements as |element|}}
    <Type @info={{element}} />
  {{/each}}
</template>;

const NamedTuple: TOC<{ Args: { info: NamedTupleMember } }> = <template>
  <div class='typedoc-named-tuple'>
    <div class='typedoc-name'>{{@info.name}}</div>
    <Type @info={{@info.element}} />
  </div>
</template>;

const Array: TOC<{ Args: { info: ArrayType } }> = <template>
  <div class='typedoc__array'>
    <div class='typedoc__array__indicator'>Array of</div>
    <Type @info={{@info.elementType}} />
  </div>
</template>;

const Function: TOC<{ Args: { info: SignatureReflection } }> = <template>
  <div class='typedoc__function'>
    <div class='typedoc__function_comment'>
      <Comment @info={{@info}} />
    </div>
    <div class='typedoc__function__type'>
      <div class='typedoc__function__open'>(</div>
      <div class='typedoc__function__parameters'>
        {{#each @info.parameters as |param|}}
          <div class='typedoc__function__parameter__container'>
            <div class='typedoc__function__parameter'>
              <div
                class='typedoc__function__parameter__name'
              >{{param.name}}</div>
              <div class='typedoc__function__parameter__type'>
                {{! @glint-expect-error }}
                <Type @info={{param.type}} />
              </div>
            </div>
            <div class='typedoc__function__parameter__comment'>
              <Comment @info={{param}} />
            </div>
          </div>
        {{/each}}
      </div>
      <div class='typedoc__function__close'>) =></div>
      <div class='typedoc__function__return_type'>
        {{! @glint-expect-error }}
        <Type @info={{@info.type}} />
      </div>
    </div>
  </div>
</template>;

const Unknown: TOC<{ Args: { info: any } }> = <template>
  <div class='typedoc__unknown'>
    {{@info.name}}
  </div>
</template>;

const Union: TOC<{ Args: { info: UnionType } }> = <template>
  <div class='typedoc__union'>
    {{#each @info.types as |type|}}
      <div class='typedoc__union__type'>
        <Type @info={{type}} />
      </div>
    {{/each}}
  </div>
</template>;

const literalAsString = (x: LiteralType['value']) => {
  if (typeof x === 'string') {
    return `"${x}"`;
  }

  if (typeof x === 'number' || typeof x === 'boolean' || x === null) {
    return `${x}`;
  }

  return x.toString();
};

const Literal: TOC<{ Args: { info: LiteralType } }> = <template>
  <div class='typedoc__literal'>
    {{literalAsString @info.value}}
  </div>
</template>;

export const Type: TOC<{ Args: { info: SomeType } }> = <template>
  {{#if (isReference @info)}}
    {{! @glint-expect-error }}
    <Reference @info={{@info}} />
  {{else if (isReflection @info)}}
    {{! @glint-expect-error }}
    <Reflection @info={{@info}} />
  {{else if (isIntrinsic @info)}}
    {{! @glint-expect-error }}
    <Intrinsic @info={{@info}} />
  {{else if (isTuple @info)}}
    {{! @glint-expect-error }}
    <Tuple @info={{@info}} />
  {{else if (isNamedTuple @info)}}
    <NamedTuple @info={{@info}} />
  {{else if (isVoidIntrinsic @info)}}
    {{! @glint-expect-error }}
    <VoidIntrinsic @info={{@info}} />
  {{else if (isArray @info)}}
    <Array @info={{@info}} />
  {{else if (isFn @info)}}
    {{! @glint-expect-error }}
    <Function @info={{@info}} />
  {{else if (isUnion @info)}}
    <Union @info={{@info}} />
  {{else if (isLiteral @info)}}
    <Literal @info={{@info}} />
  {{else if (isUnknownType @info)}}
    <Unknown @info={{@info}} />
  {{else}}
    {{! template-lint-disable no-log }}
    {{log 'Unknown Type' @info}}
  {{/if}}
</template>;
