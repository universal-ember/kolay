import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { start as qunitStart } from 'ember-qunit';

import Application from '../app/app.ts';
import config from '../app/config.ts';

export function start() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setApplication(Application.create(config.APP as any /* wrong ?*/));

  setup(QUnit.assert);

  qunitStart();
}
