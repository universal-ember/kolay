import { currentURL, getSettledState, setApplication } from '@ember/test-helpers';
import { getPendingWaiterState } from '@ember/test-waiters';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation, start as qunitStart } from 'ember-qunit';

import { docsManager, selected, typedocLoader } from 'kolay';

import Application from '../src/app.ts';
import config, { enterTestMode } from '../src/config.ts';

Object.assign(window, {
  currentURL,
  getSettledState,
  getPendingWaiterState,
  services: {
    docsManager,
    selected,
    typedocLoader,
  },
});

QUnit.config.urlConfig.push({
  id: 'skipAllLinks',
  label: 'Skip "all links" test',
});

export function start() {
  enterTestMode();
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  QUnit.config.ignoreGlobalErrors = true;
  qunitStart();
}
