import Component from '@glimmer/component';
import { service } from '@ember/service';

import { pascalCase, sentenceCase } from 'change-case';
import { GroupNav } from 'kolay/components';

import type { TOC } from '@ember/component/template-only';
import type { Collection, DocsService, Page } from 'kolay';

export class Nav extends Component {
  @service('kolay/docs') declare docs: DocsService;

  <template>
    <nav id="side-nav">
      <Pages @item={{this.docs.tree}} />
    </nav>
    <style>
      nav#side-nav { min-width: 150px; ul { padding-left: 0.5rem; list-style: none; line-height:
      1.75rem; } }
    </style>
  </template>
}

function isCollection(x: Page | Collection): x is Collection {
  return 'pages' in x;
}

function nameFor(x: Page) {
  // We defined componentName via json file
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('componentName' in x) {
    return `${x.componentName}`;
  }

  if (x.path.includes('/components/')) {
    return `<${pascalCase(x.name)} />`;
  }

  return sentenceCase(x.name);
}

const Pages: TOC<{ Args: { item: Page | Collection } }> = <template>
  <ul>
    {{#if (isCollection @item)}}
      {{#each @item.pages as |page|}}
        <li>
          {{#if (isCollection page)}}
            {{sentenceCase page.name}}
          {{/if}}

          <Pages @item={{page}} />
        </li>
      {{/each}}
    {{else}}
      <a href={{@item.path}}>{{nameFor @item}}</a>
    {{/if}}
  </ul>
</template>;

export const TopNav = GroupNav;
