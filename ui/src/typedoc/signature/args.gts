import { Comment, isIntrinsic, Type } from '../renderer.gts';

import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection } from 'typedoc';

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
    <h3 class='typedoc-heading'>Arguments</h3>
    {{#each (listifyArgs @info) as |child|}}
      <span class='typedoc-{{@kind}}-arg'>
        <span class='typedoc-{{@kind}}-arg-info'>
          <pre class='typedoc-name'>{{if (isComponent @kind) "@"}}{{child.name}}</pre>
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

function listifyArgs(info: DeclarationReflection): any[] {
  if (!info) return [];

  if (Array.isArray(info)) {
    return info;
  }

  if ('children' in info && Array.isArray(info.children)) {
    return info.children;
  }

  if (info.type && 'declaration' in info.type && info.type.declaration) {
    return listifyArgs(info.type.declaration);
  }

  console.log('unhandled', info);

  return [];
}
