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

  // a scoped mount: brings all of the docs from the "guides" group into
  // this route — the mount's path does not need to match the group's name
  this.route("help", function () {
    addRoutes(this, "guides");
  });

  // an unscoped mount serves whichever group the URL names, so its path
  // must match the group's name
  this.route("demos", function () {
    addRoutes(this);
  });
});
