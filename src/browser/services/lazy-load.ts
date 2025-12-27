import { assert } from '@ember/debug';
import Service from '@ember/service';

import type Owner from '@ember/owner';

export const KEY = 'kolay/-private/😉 wut r u doin? ❤️';

export function getKey(owner: Pick<Owner, 'lookup'>) {
  const service = owner.lookup(`service:${KEY}`);

  assert(
    `Expected the Kolay private service to exist, but it did not. Is the owner correct and app-tree-merging enabled?`,
    service
  );

  return service;
}

/**
 * Not exactly lazy load, but allows lazy loading.
 * This is a "well known" service that all the lazy loaded
 * stuff will attach to.
 *
 * it *MUST* be mounted at the above path
 *
 * This is so that our private services have a lifetime to attach to.
 */
export class KolayLazyLoadService extends Service {}
