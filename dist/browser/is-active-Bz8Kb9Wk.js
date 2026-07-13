/**
 * Whether a manifest item is the currently visited page.
 *
 * For a `Page`, the item's `appRelativePath` (computed at build time) is
 * compared against the app-relative `router.currentURL`, ignoring query
 * params / hash, and treating paths with and without the `.md` extension as
 * the same page (both are visitable).
 *
 * For a `Collection`, this is true when any page within it (recursively) is
 * active — useful for highlighting or expanding the branch of a nav tree that
 * contains the current page.
 *
 * ```gjs
 * import { isActive } from 'kolay';
 *
 * // in a component with the router service injected
 * isActive(item, this.router.currentURL);
 * ```
 */
function isActive(item, currentURL) {
  // a Collection (see also: isCollection from './utils.ts', which cannot be
  // imported here without breaking this module's ember-free-ness)
  if ('pages' in item) {
    return item.pages.some(child => isActive(child, currentURL));
  }
  const subPath = item.appRelativePath;
  if (subPath === '/') return false;
  const [current = ''] = currentURL?.split(/[?#]/) ?? [];
  return current.replace(/\.md$/, '') === subPath.replace(/\.md$/, '');
}

export { isActive as i };
//# sourceMappingURL=is-active-Bz8Kb9Wk.js.map
