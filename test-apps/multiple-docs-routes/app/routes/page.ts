import Route from "@ember/routing/route";

import { handlePotentialIndexVisit } from "kolay";

import type Transition from "@ember/routing/transition";

/**
 * The top-level `addRoutes(this)` mount's own route, so a URL it catches
 * that has no page of its own redirects like the `help` and `demos` mounts
 * do — including a collection group's URL, which names no group.
 */
export default class PageRoute extends Route {
  beforeModel(transition: Transition) {
    handlePotentialIndexVisit(this, transition);
  }
}
