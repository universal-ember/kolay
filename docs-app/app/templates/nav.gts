import Component from '@glimmer/component';
import { service } from '@ember/service';

import { pascalCase } from 'change-case';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';
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

  return x.name;
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
      <a href={{@item.path}}>{{nameFor @item}}</a>
    {{/if}}
  </ul>
</template>;

export class TopNav extends Component {
  @service('kolay/docs') declare docs: DocsService;
  @service declare router: RouterService;

  get groups() {
    return this.docs.availableGroups.map((groupName) => {
      if (groupName === 'root') return { text: 'Home', value: '/' };

      return { text: groupName, value: `/${groupName}` };
    });
  }

  isActive = (subPath: string) => {
    if (subPath === '/') return false;

    return this.router.currentURL?.startsWith(subPath);
  };

  <template>
    <nav id="group-nav">
      <ul>
        {{#each this.groups as |group|}}
          <li>
            <a href={{group.value}} class={{if (this.isActive group.value) "active"}}>
              {{group.text}}
            </a>
          </li>
        {{/each}}
      </ul>
    </nav>
  </template>
}
