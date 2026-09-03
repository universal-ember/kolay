import { getOwner } from "@ember/owner";
import Route from "@ember/routing/route";

import { setupKolay } from "kolay/setup";

export default class ApplicationRoute extends Route {
  async model() {
    const appOwner = getOwner(this);

    /**
     * Exercises `formatOptions`: compiled pages and live snippets resolve
     * their `getOwner(...)` lookups through this owner instead of the
     * default app-delegating one. The probe key is read by
     * owner-probe.gjs.md; everything else falls through to the app so
     * other pages behave normally.
     */
    const probeOwner = {
      lookup: (name: string) => {
        if (name === "kolay-test:probe") {
          return "from-custom-owner";
        }

        return appOwner?.lookup(name as `${string}:${string}`);
      },
    };

    await setupKolay(this, {
      formatOptions: {
        gjs: { owner: probeOwner },
        gmd: { owner: probeOwner },
      },
    });
  }
}
