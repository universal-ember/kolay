import Route from '@ember/routing/route';

import { handlePotentialIndexVisit } from 'kolay';

import type RouterService from '@ember/routing/router-service';

type Transition = ReturnType<RouterService['transitionTo']>;

export default class ApplicationRoute extends Route {
  beforeModel(transition: Transition) {
    handlePotentialIndexVisit(this, transition);
  }
}
