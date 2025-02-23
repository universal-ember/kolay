import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

export default class NotHere extends Route {
  @service declare router: RouterService;

  beforeModel() {
    this.router.replaceWith('/usage/setup.md');
  }
}
