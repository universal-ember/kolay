import EmbroiderRouter from "@embroider/router";

import { properLinks } from "ember-primitives/proper-links";
import { addRoutes as addGuidesRoutes } from "virtual:kolay/docs/guides";

import config from "#config";

@properLinks
export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // no top-level addRoutes(this): the root URL space belongs to the app
  // (see templates/index.gjs); only the group's own routes are mounted
  this.route("help", function () {
    addGuidesRoutes(this);
  });
});
