import { stripRootURL } from './strip-root-url.ts';

import type { Collection, Page } from '../types.ts';

/**
 * Whether a manifest item is the currently visited page.
 *
 * For a `Page`, the comparison is rootURL-aware (manifest paths include the
 * app's rootURL, while `router.currentURL` is app-relative), ignores query
 * params / hash, and treats paths with and without the `.md` extension as the
 * same page (both are visitable).
 *
 * For a `Collection`, this is true when any page within it (recursively) is
 * active — useful for highlighting or expanding the branch of a nav tree that
 * contains the current page.
 *
 * ```gjs
 * import { isActive } from 'kolay';
 *
 * // in a component with the router service injected
 * isActive(item, this.router.currentURL, this.router.rootURL);
 * ```
 */
export function isActive(
  item: Page | Collection,
  currentURL: string | null | undefined,
  rootURL: string
): boolean {
  // a Collection (see also: isCollection from './utils.ts', which cannot be
  // imported here without breaking this module's ember-free-ness)
  if ('pages' in item) {
    return item.pages.some((child) => isActive(child, currentURL, rootURL));
  }

  const subPath = stripRootURL(item.path, rootURL);

  if (subPath === '/') return false;

  const [current = ''] = currentURL?.split(/[?#]/) ?? [];

  return current.replace(/\.md$/, '') === subPath.replace(/\.md$/, '');
}
