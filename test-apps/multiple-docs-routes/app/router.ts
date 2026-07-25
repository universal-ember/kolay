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
  // the co-located pages (app/templates/**/*.md) are served from the root
  addRoutes(this);

  // each group from vite.config.mjs is mounted as its own route,
  // whose path matches the group's name
  this.route("guides", function () {
    addRoutes(this);
  });

  this.route("demos", function () {
    addRoutes(this);
  });
});
