import EmberRouter from '@ember/routing/router';

import { properLinks } from 'ember-primitives/proper-links';
import { addRoutes } from 'kolay';
import { addRoutes as addRuntimeRoutes } from 'virtual:kolay/docs/Runtime';
import { addRoutes as addTypeDocRoutes } from 'virtual:kolay/docs/TypeDoc';

import config from './config.ts';

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // the co-located pages (Home)
  addRoutes(this);
  this.route('search');

  // each group in its own mount, so each can have its own page template
  // (and with it, its own design — see templates/runtime and
  // templates/typedoc)
  this.route('runtime', { path: '/Runtime' }, function () {
    addRuntimeRoutes(this);
  });

  this.route('typedoc', { path: '/TypeDoc' }, function () {
    addTypeDocRoutes(this);
  });
});
