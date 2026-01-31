/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
interface Config {
  environment: "development" | "production";
  locationType: "history" | "hash" | "none" | "auto";
  rootURL: string;
  EmberENV?: Record<string, unknown>;
  APP: Record<string, unknown> & { rootElement?: string; autoboot?: boolean };
}

const ENV: Config = {
  environment: import.meta.env.DEV ? "development" : "production",
  rootURL: "/",
  locationType: "history",
  EmberENV: {},
  APP: {},
};

export default ENV;

// @ts-expect-error: Ignoreing private API
import { getGlobalConfig } from "@embroider/macros/src/addon/runtime";

export function enterTestMode() {
  ENV.locationType = "none";
  ENV.APP.rootElement = "#ember-testing";
  ENV.APP.autoboot = false;

  const theMacrosGlobal = getGlobalConfig();

  theMacrosGlobal["@embroider/macros"] ||= {};
  theMacrosGlobal["@embroider/macros"].isTesting ||= true;
}
