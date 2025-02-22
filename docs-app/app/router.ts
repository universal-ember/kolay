import EmberRouter from '@ember/routing/router';

import config from './config.ts';
import { properLinks } from 'ember-primitives/proper-links';
import { addRoutes } from 'kolay';

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  addRoutes(this);
});
