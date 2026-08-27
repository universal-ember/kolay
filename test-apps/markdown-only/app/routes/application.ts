import Route from "@ember/routing/route";

import { setupTabster } from "ember-primitives/tabster";
import { setupKolay } from "kolay/setup";

export default class ApplicationRoute extends Route {
  async model() {
    // <CommandPalette>, behind <Search />, needs a focus manager, the same
    // way <Menu> does
    await Promise.all([setupKolay(this, {}), setupTabster(this)]);
  }
}
