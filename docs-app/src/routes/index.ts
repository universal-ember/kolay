import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';

export default class NotHere extends Route {
  @service declare router: RouterService;

  beforeModel() {
    this.router.replaceWith('/usage/setup.md');
  }
}
