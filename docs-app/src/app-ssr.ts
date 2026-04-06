import Application from '@ember/application';

import Resolver from 'ember-resolver';

import config from './config.ts';
import { registry } from './registry.ts';
import Router from './router.ts';

class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(registry);
}

export function createSsrApp() {
  return App.create({ ...config.APP, autoboot: false });
}
