import { Comment, isIntrinsic, Type } from '../renderer.gts';

import type { TOC } from '@ember/component/template-only';

const not = (x: unknown) => !x;

export const NamedArgs: TOC<{
  Args: { kind: 'component' | 'modifier' | 'helper'; info: any };
}> = <template>
  {{#if @info}}
    <h3 class='typedoc-heading'>Arguments</h3>
    {{#each @info.type.declaration.children as |child|}}
      <span class='typedoc-{{@kind}}-arg'>
        <span class='typedoc-{{@kind}}-arg-info'>
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
