import Route from "@ember/routing/route";

import { setupKolay } from "kolay/setup";

export default class ApplicationRoute extends Route {
  async model() {
    await setupKolay(this, {});
  }
}
