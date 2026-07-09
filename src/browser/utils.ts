import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';

import type { Collection, Page } from '../types.ts';
import type Owner from '@ember/owner';

export function isCollection(x: Page | Collection): x is Collection {
  return 'pages' in x;
}

export function isIndex(x: Page | Collection) {
  if (isCollection(x)) return false;

  return x.path.endsWith('index');
}

export function getIndexPage(x: Collection): Page | undefined {
  const page = x.pages.find(isIndex);

  if (page && isCollection(page)) return;

  return page;
}

/////////////////////////////////
// copied from ember-primitives
// should these be exposed?
/////////////////////////////////

/**
 * Loose check for an "ownerish" API.
 * only the ".lookup" method is required.
 *
 * The requirements for what an "owner" is are sort of undefined,
 * as the actual owner in ember applications has too much on it,
 * and the long term purpose of the owner will be questioned once we
 * eliminate the need to have a registry (what lookup looks in to),
 * but we'll still need "Something" to represent the lifetime of the application.
 *
 * Technically, the owner could be any object, including `{}`
 */
export function isOwner(x: unknown): x is Owner {
  if (!isNonNullableObject(x)) return false;

  return 'lookup' in x && typeof x.lookup === 'function';
}

export function isNonNullableObject(x: unknown): x is NonNullable<object> {
  if (typeof x !== 'object') return false;
  if (x === null) return false;

  return true;
}

/**
 * Can receive the class instance or the owner itself, and will always return return the owner.
 *
 * undefined will be returned if the Owner does not exist on the passed object
 *
 * Can be useful when combined with `createStore` to then create "services",
 * which don't require string lookup.
 */
export function findOwner(contextOrOwner: unknown): Owner | undefined {
  if (isOwner(contextOrOwner)) return contextOrOwner;

  // _ENSURE_ that we have an object, else getOwner makes no sense to call
  if (!isNonNullableObject(contextOrOwner)) return;

  const maybeOwner = getOwner(contextOrOwner);

  if (isOwner(maybeOwner)) return maybeOwner;

  return;
}

export function forceFindOwner(contextOrOwner: unknown): Owner {
  const maybe = findOwner(contextOrOwner);

  assert(`Did not find owner. An owner is required`, maybe);

  return maybe;
}

interface LRUNode<V> {
  key: unknown;
  value: V;
  prev: LRUNode<V>;
  next: LRUNode<V>;
}

class LRUCache<Value> {
  #max: number;
  #map = new Map<unknown, LRUNode<Value>>();
  #head = {} as LRUNode<Value>;
  #tail = {} as LRUNode<Value>;

  constructor(max = 128) {
    this.#max = max;
    this.#head.next = this.#tail;
    this.#tail.prev = this.#head;
  }

  get(key: unknown): Value | undefined {
    const node = this.#map.get(key);

    if (!node) return undefined;

    this.#remove(node);
    this.#insertAfterHead(node);

    return node.value;
  }

  set(key: unknown, value: Value): void {
    if (this.#map.has(key)) return;

    const node = { key, value } as LRUNode<Value>;

    this.#map.set(key, node);
    this.#insertAfterHead(node);

    if (this.#map.size > this.#max) {
      this.#map.delete(this.#tail.prev.key);
      this.#remove(this.#tail.prev);
    }
  }

  #remove(node: LRUNode<Value>): void {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  #insertAfterHead(node: LRUNode<Value>): void {
    node.next = this.#head.next;
    node.prev = this.#head;
    this.#head.next.prev = node;
    this.#head.next = node;
  }
}

const defaultCache = new LRUCache<unknown>();

export function lru<Value, Key = unknown>(key: Key, compute: (key: Key) => Value): Value {
  let value = defaultCache.get(key) as Value | undefined;

  if (value === undefined) {
    value = compute(key);
    defaultCache.set(key, value);
  }

  return value;
}
