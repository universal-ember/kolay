import { assert } from '@ember/debug';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';

import type { Secret } from '../../types.ts';
import type Owner from '@ember/owner';

export const KEY = 'kolay/private/😉-wut-r-u-doin-❤️';

const SECRET = Symbol.for('__kolay__secret__context__');

/**
 * same logic in the setup.js plugin
 */
export function setupSecret(owner: Owner) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const secret = ((window as any)[SECRET] ||= {}) as Secret;

  secret.owners ||= new Set();

  secret.owners.add(owner);

  registerDestructor(owner, () => secret.owners.delete(owner));
}

export function getKey(_owner: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const secret = (window as any)[SECRET] as unknown as Secret;

  for (const owner of secret.owners) {
    const isDanger = isDestroying(owner) || isDestroyed(owner);

    if (!isDanger) return owner;
  }

  assert(
    `Expected to have had setupKolay called from 'kolay/setup'. Be sure to call setupKolay before trying to use any of Kolay's components`
  );
}
