import { ExternalLink } from 'ember-primitives/components/external-link';
import { Comment } from '../renderer.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

const mdnElement = typeName => {
  const element = typeName.replace('HTML', '').replace('Element', '').toLowerCase();
  return `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${element}`;
};
const Element = setComponentTemplate(precompileTemplate("\n  {{#if @info}}\n    <h3 class=\"typedoc__heading typedoc__{{@kind}}-signature__element-header\">\n      <span class=\"typedoc__name\">{{@info.name}}</span>\n      <span class=\"typedoc__{{@kind}}-signature__element-type\">\n        <ExternalLink href={{mdnElement @info.type.name}} class=\"typedoc__type-link\">\n          {{@info.type.name}}\n          \u279A\n        </ExternalLink>\n      </span>\n    </h3>\n    <span class=\"typedoc__{{@kind}}-signature__element\">\n      <Comment @info={{@info}} />\n    </span>\n  {{/if}}\n", {
  strictMode: true,
  scope: () => ({
    ExternalLink,
    mdnElement,
    Comment
  })
}), templateOnly());

export { Element };
//# sourceMappingURL=element.js.map
