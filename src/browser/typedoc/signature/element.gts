import { ExternalLink } from 'ember-primitives/components/external-link';
import { Heading } from 'ember-primitives/components/heading';

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
  Args: { kind: 'component' | 'modifier'; info: any };
}> = <template>
  {{#if @info}}
    {{!
      No <section> around this (or any sibling) heading:
      a nested heading-less <section> is its own sectioning boundary, which
      would cut automatic heading-level detection off from the surrounding
      document and pin this heading to <h1>. The section these headings
      belong to is the one rendered by <Load>.
    }}
    <Heading class='typedoc__heading typedoc__{{@kind}}-signature__element-header'>
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
    </Heading>
    <span class='typedoc__{{@kind}}-signature__element'>
      <Comment @info={{@info}} />
    </span>
  {{/if}}
</template>;
