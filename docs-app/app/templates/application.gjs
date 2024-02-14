import ENV from 'docs-app/config/environment';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';

const Nav = <template>
  <ul>
    {{#each @item.pages as |page|}}
      {{#if page.path}}
        <li>
          <a href={{page.path}}>{{page.name}}</a>
        </li>
      {{else}}
        <li>
          {{page.name}}
          <Nav @item={{page}} />
        </li>
      {{/if}}
    {{/each}}
  </ul>
</template>;

export default Route(
  <template>
    {{pageTitle ENV.APP.shortVersion}}

    <div class="application__layout">
      <nav>
        <Nav @item={{@model.manifest.tree}} />
      </nav>
      <main>
        {{outlet}}
      </main>
    </div>
    <style>
      .application__layout { display: grid; grid-template-columns: max-content 1fr; gap: 1rem; }
    </style>
  </template>
);
