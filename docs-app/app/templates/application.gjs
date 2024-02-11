// NOTE: this is a virtual module and doesn't actually exist
//       the build emits it
import ENV from 'docs-app/config/environment';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';

import { Demo } from './demo/logs';

export default Route(
  <template>
    {{pageTitle ENV.APP.shortVersion}}

    {{outlet}}
    <Logs />
    <pre><code>{{JSON.stringify @model.manifest null 3}}</code></pre>
  </template>
);
