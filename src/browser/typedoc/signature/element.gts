import { ExternalLink } from 'ember-primitives/components/external-link';

import { Comment } from '../renderer.gts';

import type { TOC } from '@ember/component/template-only';

const mdnElement = (typeName: string) => {
  let element = typeName
    .replace('HTML', '')
    .replace('Element', '')
    .toLowerCase();

  return `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${element}`;
};

export const Element: TOC<{
  Args: { kind: 'component' | 'modifier'; info: any };
}> = <template>
  {{#if @info}}
    <h3 class='typedoc__heading typedoc__{{@kind}}-signature__element-header'>
      <span class='typedoc__name'>{{@info.name}}</span>
      <span class='typedoc__{{@kind}}-signature__element-type'>
        <ExternalLink
          href={{mdnElement @info.type.name}}
          class='typedoc__type-link'
        >
          {{@info.type.name}}
          ➚
        </ExternalLink>
      </span>
    </h3>
    <span class='typedoc__{{@kind}}-signature__element'>
      <Comment @info={{@info}} />
    </span>
  {{/if}}
</template>;
