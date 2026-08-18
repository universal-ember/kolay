# `<Logs />`

Use this component in a demo that writes to the browser console. It shows the log in the page, so a reader does not open the dev tools. The layout of the demo stays as it is.

The component also writes each message to the console, so the `console` APIs behave as you expect.

The component has a maximum height. It scrolls down as each new message arrives.

In this demo, the input writes a `console` message for each character that you type.

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
