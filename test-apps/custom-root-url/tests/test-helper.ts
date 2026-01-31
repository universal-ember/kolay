/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { getOwner } from "@ember/owner";
import {
  currentRouteName,
  currentURL,
  getSettledState,
  resetOnerror,
  setApplication,
  visit,
} from "@ember/test-helpers";
import { getPendingWaiterState } from "@ember/test-waiters";
import * as QUnit from "qunit";
import { setup } from "qunit-dom";
import { setupEmberOnerrorValidation, start as qunitStart } from "ember-qunit";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { getGlobalConfig } from "@embroider/macros/src/addon/runtime";

import Application from "#app/app.ts";
import config, { enterTestMode } from "#config";

Object.assign(window, {
  visit,
  getSettledState,
  getPendingWaiterState,
  currentURL,
  currentRouteName,
  getOwner,
  snapshotTimers: (label?: string) => {
    console.debug(
      label ?? "snapshotTimers",
      JSON.parse(
        JSON.stringify({
          settled: getSettledState(),
          waiters: getPendingWaiterState(),
        }),
      ),
    );
  },
});

export function start() {
  enterTestMode();

  const theMacrosGlobal = getGlobalConfig();

  /**
   * Caveats:
   * - https://github.com/embroider-build/embroider/issues/2660
   * - https://github.com/embroider-build/embroider/issues/1998
   *
   */
  theMacrosGlobal["@embroider/macros"] ||= {};
  theMacrosGlobal["@embroider/macros"].isTesting ||= true;

  setApplication(Application.create(config.APP));
  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.moduleStart(({ name }) => console.group(name));
  QUnit.testStart(({ name }) => console.group(name));
  QUnit.testDone(() => console.groupEnd());
  QUnit.moduleDone(() => console.groupEnd());
  QUnit.testDone(resetOnerror);

  qunitStart();
}
