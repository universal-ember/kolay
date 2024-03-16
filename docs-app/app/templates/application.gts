import { pascalCase, sentenceCase } from 'change-case';
import ENV from 'docs-app/config/environment';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';
import { GroupNav, PageNav } from 'kolay/components';

import type { Page } from 'kolay';

export default Route(
  <template>
    {{pageTitle ENV.APP.shortVersion}}

    <div class="container">
      <header>
        <GroupNav />
      </header>

      <div class="application__layout">
        <aside>
          <PageNav id="side-nav">
            <:page as |page|>
              {{nameFor page}}
            </:page>
            <:collection as |collection|>
              {{sentenceCase collection.name}}
            </:collection>
          </PageNav>
        </aside>

        <main>
          {{outlet}}
        </main>
      </div>

    </div>
    <style>
      .application__layout { display: grid; grid-template-columns: max-content 1fr; gap: 2rem;
      padding-top: 1rem; } header { border-bottom: 1px solid currentColor; } nav#side-nav {
      min-width: 150px; ul { padding-left: 0.5rem; list-style: none; line-height: 1.75rem; } }
    </style>
  </template>
);

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
