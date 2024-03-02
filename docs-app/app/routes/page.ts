import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type { DocsService } from 'kolay';
type Transition = ReturnType<RouterService['transitionTo']>;

export default class ApplicationRoute extends Route {
  @service declare router: RouterService;
  @service('kolay/docs') declare docs: DocsService;

  /**
   * Does our target destination exist? if not,
   * redirect to the first page on the namespace
   */
  beforeModel(transition: Transition) {
    if (transition.to?.localName !== 'index') return;

    let yolo = transition as any;

    console.log(yolo.intent?.url, transition);

    let groupName = (transition.to as any  /* that didn't take long */).parent?.params?.page;

    if (!groupName) return;
    if (!this.docs.availableGroups.includes(groupName)) return;

    let group = this.docs.groupFor(groupName);

    let first = group.list[0];

    if (!first) {
      console.warn(`Could not determine first page in group: ${groupName}`);

      return;
    }

    this.router.transitionTo(first.path);
  }
}
