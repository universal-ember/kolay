import ENV from 'docs-app/config/environment';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';

import { Nav, TopNav } from './nav';

export default Route(
  <template>
    {{pageTitle ENV.APP.shortVersion}}

    <div class="container">
      <header>
        <TopNav />
      </header>

      <div class="application__layout">
        <aside>
          <Nav />
        </aside>

        <main>
          {{outlet}}
        </main>
      </div>

    </div>
    <style>
      .application__layout { display: grid; grid-template-columns: max-content 1fr; gap: 2rem; }
      header { filter: drop-shadow(0 10px 0.75rem #000000); }
    </style>
  </template>
);
