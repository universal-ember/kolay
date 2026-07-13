import { Heading } from 'ember-primitives/components/heading';

import { Comment, isIntrinsic, isNamedTuple, Type } from '../renderer.gts';

import type { TOC } from '@ember/component/template-only';
import type {
  DeclarationReflection,
  Reflection,
  ReflectionFlags,
  SignatureReflection,
} from 'typedoc';

const not = (x: unknown) => !x;

const isComponent = (kind: 'component' | 'modifier' | 'helper') => kind === 'component';

/**
 * Only components' args are prefixed with a `@`,
 * because only components have template-content.
 */
export const Args: TOC<{
  Args: { kind: 'component' | 'modifier' | 'helper'; info: any };
}> = <template>
  {{#if @info}}
    <Heading class='typedoc__heading'>Arguments</Heading>
    {{#each (listifyArgs @info) as |child|}}
      <span class='typedoc__{{@kind}}-signature__arg'>
        <span class='typedoc__{{@kind}}-signature__arg-info'>
          <pre class='typedoc__name'>{{if (isComponent @kind) '@'}}{{child.name}}</pre>
          {{#if (isIntrinsic child.type)}}
            <Type @info={{child.type}} />
          {{else if (isNamedTuple child)}}
            <Type @info={{child.element}} />
          {{/if}}
        </span>

        {{#if (getFlags child.flags)}}
          {{! we can potentially display more flags here in the future }}
          <Flags @flags={{child.flags}} />
        {{/if}}

        {{#if (not (isIntrinsic child.type))}}
          <Type @info={{child.type}} />
        {{else if (isNamedTuple child)}}
          <Type @info={{child.element}} />
        {{else}}
          <Comment @info={{child}} />
        {{/if}}
      </span>
    {{/each}}
  {{/if}}
</template>;

function listifyArgs(info: DeclarationReflection | Reflection): any[] {
  if (!info) return [];

  if (Array.isArray(info)) {
    return info;
  }

  /**
   * This object *may* have Named and Positional on them,
   * in which case, we want to create [...Positional, Named]
   */
  if ('children' in info && Array.isArray(info.children)) {
    if (info.children.length <= 2) {
      const flattened = flattenArgs(info.children);

      if (flattened.length > 0) {
        return flattened;
      }
    }

    return info.children;
  }

  let declaration = null;

  if ('type' in info && info.type && 'declaration' in info.type && info.type.declaration) {
    declaration = info.type.declaration;
  }

  if ('type' in info && info.type && info.type.type === 'reference') {
    declaration = info.project.getReflectionById(info.type['_target']);
  }

  if (declaration) {
    return listifyArgs(declaration);
  }

  console.warn('unhandled', info);

  return [];
}

function flattenArgs(args: any[]): any[] {
  const named = args.find((x) => x.name === 'Named');
  const positional = args.find((x) => x.name === 'Positional');

  const result = [];

  if (positional) {
    result.push(positional.type?.elements);
  }

  if (named) {
    result.push(named);
  }

  return result.flat();
}

/**
 * Returns args for either a function or signature
 */
export function getArgs(
  info?: Reflection | SignatureReflection | DeclarationReflection | DeclarationReflection[]
) {
  if (!info) return [];

  if ('parameters' in info) {
    return info.parameters;
  }

  if (Array.isArray(info)) {
    return info.find((item) => item.name === 'Args');
  }

  if ('children' in info) {
    return getArgs(info.children);
  }
}

const Flags: TOC<{
  Args: { flags: ReflectionFlags };
}> = <template>
  <span class='typedoc__arg-flags'>
    {{#each (getFlags @flags) as |flag|}}
      <span class='typedoc__flag'>{{flag}}</span>
    {{/each}}
  </span>
</template>;

function getFlags(flags: ReflectionFlags): any[] {
  // extremely simplified logic to determine flags, for now we only interested in `isOptional`
  return [flags?.isOptional && 'optional'].filter(Boolean);
}
