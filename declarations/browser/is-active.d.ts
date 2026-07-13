import type { Collection, Page } from '../types.ts';
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
export declare function isActive(item: Page | Collection, currentURL: string | null | undefined): boolean;
//# sourceMappingURL=is-active.d.ts.map