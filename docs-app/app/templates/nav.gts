import Component from '@glimmer/component';
import { service } from '@ember/service';

import type { TOC } from '@ember/component/template-only';
import type { Collection, DocsService, Page } from 'kolay';

export class Nav extends Component {
  @service('kolay/docs') declare docs: DocsService;

  <template>
    <nav>
      <Pages @item={{this.docs.tree}} />
    </nav>
    <style>nav ul { padding-left: 0.5rem; list-style: none; line-height: 1.75rem; }</style>
  </template>
}

function isCollection(x: Page | Collection): x is Collection {
  return 'pages' in x;
}

const Pages: TOC<{ Args: { item: Page | Collection } }> = <template>
  <ul>
    {{#if (isCollection @item)}}
      {{#each @item.pages as |page|}}
        <li>
          {{#if (isCollection page)}}
            {{page.name}}
          {{/if}}

          <Pages @item={{page}} />
        </li>
      {{/each}}
    {{else}}
      <a href={{@item.path}}>{{@item.name}}</a>
    {{/if}}
  </ul>
</template>;

export class TopNav extends Component {
  @service('kolay/docs') declare docs: DocsService;

  get groups() {
    return this.docs.availableGroups.map((groupName) => {
      if (groupName === 'root') return { text: 'Home', value: '/' };

      return { text: groupName, value: `/${groupName}` };
    });
  }

  <template>
    <nav id="group-nav">
      {{#each this.groups as |group|}}
        <a href={{group.value}}>
          {{group.text}}
        </a>
      {{/each}}
    </nav>
    <style>
      nav#group-nav { display: flex; gap: 0.5rem; }
    </style>
  </template>
}
