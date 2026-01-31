import EmbroiderRouter from "@embroider/router";

import { properLinks } from "ember-primitives/proper-links";
import { addRoutes } from "kolay";

import config from "#config";

@properLinks
export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  addRoutes(this);
});
