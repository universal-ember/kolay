# `<Logs />`

This component is useful for demos which would log things to the browser console, and displays the log in the viewport so that users don't need to actully open their dev tools, allowing the invocation site to keep its layout.

Messages are still logged to the console as to not break the expected behavior of `console` apis.

This component has a max-height,and will auto-scroll as new messages are printed.

In this demo, a `console` message is printed every character entry in the input.

```gjs live no-shadow preview
import { Form } from 'ember-primitives';
import { Logs } from 'kolay/components';

function addToLog(y) {
  console.info(y.logInput);
}

<template>
  <Form @onChange={{addToLog}}>
    <label>
      Type to console.log
      <input name='logInput' />
    </label>
  </Form>

  <Logs />
</template>
```
