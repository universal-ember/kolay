import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation, start as qunitStart } from 'ember-qunit';

import Application from '../src/app.ts';
import config, { enterTestMode } from '../src/config.ts';

export function start() {
  enterTestMode();
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  // window.addEventListener('error', (e) => {
  //   e.preventDefault();
  //
  //   return false;
  // });
  //
  // window.addEventListener('unhandledrejection', (e) => {
  //   e.preventDefault();
  //
  //   return false;
  // });

  qunitStart();
}
