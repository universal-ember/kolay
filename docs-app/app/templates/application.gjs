import ENV from 'docs-app/config/environment';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';

import { Nav, TopNav } from './nav';

export default Route(
  <template>
    {{pageTitle ENV.APP.shortVersion}}

    <TopNav />

    <div class="application__layout">
      <Nav />

      <main>
        {{outlet}}
      </main>
    </div>
    <style>
      .application__layout { display: grid; grid-template-columns: max-content 1fr; gap: 1rem; }
    </style>
  </template>
);
