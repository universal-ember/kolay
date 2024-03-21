import { Comment, isIntrinsic, isNamedTuple, Type } from '../renderer.gts';

import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection } from 'typedoc';

const not = (x: unknown) => !x;

const isComponent = (kind: 'component' | 'modifier' | 'helper') =>
  kind === 'component';

/**
 * Only components' args are prefixed with a `@`,
 * because only components have template-content.
 */
export const Args: TOC<{
  Args: { kind: 'component' | 'modifier' | 'helper'; info: any };
}> = <template>
  {{#if @info}}
    <h3 class='typedoc__heading'>Arguments</h3>
    {{#each (listifyArgs @info) as |child|}}
      <span class='typedoc__{{@kind}}-signature__arg'>
        <span class='typedoc__{{@kind}}-signature__arg-info'>
          <pre class='typedoc__name'>{{if
              (isComponent @kind)
              '@'
            }}{{child.name}}</pre>
          {{#if (isIntrinsic child.type)}}
            <Type @info={{child.type}} />
          {{else if (isNamedTuple child)}}
            <Type @info={{child.element}} />
          {{/if}}
        </span>
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

function listifyArgs(info: DeclarationReflection): any[] {
  if (!info) return [];

  if (Array.isArray(info)) {
    return info;
  }

  /**
   * This object *may* have Named and Positional on them,
   * in which case, we want to create [...Postiional, Named]
   */
  if ('children' in info && Array.isArray(info.children)) {
    if (info.children.length <= 2) {
      let flattened = flattenArgs(info.children);

      if (flattened.length > 0) {
        return flattened;
      }
    }

    return info.children;
  }

  if (info.type && 'declaration' in info.type && info.type.declaration) {
    return listifyArgs(info.type.declaration);
  }

  // eslint-disable-next-line no-console
  console.warn('unhandled', info);

  return [];
}

function flattenArgs(args: any[]): any[] {
  let named = args.find((x) => x.name === 'Named');
  let positional = args.find((x) => x.name === 'Positional');

  let result = [];

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
export function getArgs(info: any) {
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
