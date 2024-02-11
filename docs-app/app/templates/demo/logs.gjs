// For the demo
import { on } from '@ember/modifier';

import { Form } from 'ember-primitives';
import { cell } from 'ember-resources';
// From this library
import { Logs } from 'kolay';
import * as X from 'kolay';

function addToLog(y) {
  console.log(y.logInput);
}

export const Demo = <template>
  <Form @onChange={{addToLog}}>
    <label>
      Type to console.log
      <input name="logInput" />
    </label>
  </Form>
  <Logs />
</template>;
