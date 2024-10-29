import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { start as qunitStart } from 'ember-qunit';

import Application from 'docs-app/app';
import config from 'docs-app/config/environment';

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);

  qunitStart();
}
