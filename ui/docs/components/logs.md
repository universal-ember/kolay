# `<Logs />`

```gjs live no-shadow
import { Form } from 'ember-primitives';
import { Logs } from 'kolay';

function addToLog(y) {
  console.info(y.logInput);
}

export const Demo = <template>
  <Form @onChange={{addToLog}}>
    <label>
      Type to console.log
      <input name='logInput' />
    </label>
  </Form>

  <Logs />
</template>;
```
