import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';

import type { Page, PageTree } from '../types.ts';
import type Owner from '@ember/owner';

/**
 * The co-located pages' group (app/templates, src/templates), as the build
 * names it (`displayName` in build/plugins/setup.js's `homeSource`). Its
 * pages live in the root URL space rather than under the group's name, so
 * its nav link is the app's root.
 */
export const HOME_GROUP = 'Home';

export function isPageTree(x: Page | PageTree): x is PageTree {
  return 'pages' in x;
}

/**
 * On the name, matching how sorting hoists one (`betterSort`). A page whose
 * name merely ends in `index`, like `api-index.md`, is an ordinary page.
 */
export function isIndex(x: Page | PageTree) {
  if (isPageTree(x)) return false;

  return x.name === 'index';
}

export function getIndexPage(x: PageTree): Page | undefined {
  const page = x.pages.find(isIndex);

  if (page && isPageTree(page)) return;

  return page;
}

/**
 * The sub-tree at an app-relative path. A group's own tree matches its root.
 */
export function findPageTree(root: PageTree, appRelativePath: string): PageTree | undefined {
  if (equalsIgnoreCase(root.appRelativePath, appRelativePath)) return root;

  for (const child of root.pages) {
    if (!isPageTree(child)) continue;

    const match = findPageTree(child, appRelativePath);

    if (match) return match;
  }

  return undefined;
}

/**
 * URLs are conventionally case-insensitive; path/route matching in this
 * library follows that convention rather than treating paths as opaque,
 * case-sensitive strings.
 */
export function equalsIgnoreCase(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Whether two paths name the same page: paths with and without the
 * `.md` extension are the same page (both are visitable).
 */
export function samePagePath(a: string, b: string): boolean {
  return equalsIgnoreCase(a.replace(/\.md$/i, ''), b.replace(/\.md$/i, ''));
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
