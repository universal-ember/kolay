import { ExternalLink } from 'ember-primitives/components/external-link';

import { SectionHeading } from '../heading.gts';
import { isLiteral } from '../narrowing.ts';
import { Comment } from '../renderer.gts';

import type { TOC } from '@ember/component/template-only';

const mdnElement = (typeName: string) => {
  const element = typeName.replace('HTML', '').replace('Element', '').toLowerCase();

  return `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${element}`;
};

function hasName(info: any) {
  return Boolean(info.type?.name);
}

export const Element: TOC<{
  Args: { kind: 'component' | 'modifier'; info: any; level: number };
}> = <template>
  {{#if @info}}
    <section>
      <SectionHeading
        @level={{@level}}
        class='typedoc__heading typedoc__{{@kind}}-signature__element-header'
      >
        <span class='typedoc__name'>{{@info.name}}</span>
        <span class='typedoc__{{@kind}}-signature__element-type'>
          {{#if (hasName @info)}}
            <ExternalLink href={{mdnElement @info.type.name}} class='typedoc__type-link'>
              {{@info.type.name}}
              ➚
            </ExternalLink>
          {{else if (isLiteral @info.type)}}
            {{String @info.type.value}}
          {{/if}}
        </span>
      </SectionHeading>
    </section>
    <span class='typedoc__{{@kind}}-signature__element'>
      <Comment @info={{@info}} />
    </span>
  {{/if}}
</template>;
