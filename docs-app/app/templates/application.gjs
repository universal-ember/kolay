// NOTE: this is a virtual module and doesn't actually exist
//       the build emits it
import ENV from 'docs-app/config/environment';
import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';

// For the demo
import { on } from '@ember/modifier';
import { cell } from 'ember-resources';
import { Form } from 'ember-primitives';

// From this library
import { Logs } from 'kolay';

const x = cell('text');
function addToLog(y) {
  console.log(y);
}

const Demo = <template>
  <Form @onChange={{addToLog}}>
    <label>
      Type to console.log
      <input name="logInput" />
    </label>
  </Form>
</template>;

export default Route(
  <template>
    {{pageTitle ENV.APP.shortVersion}}

    {{outlet}}

    <Logs />
  </template>
);
