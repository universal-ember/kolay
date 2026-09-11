import type { Page, PageTree } from '../types.ts';
import type Owner from '@ember/owner';
/**
 * The co-located pages' group (app/templates, src/templates), as the build
 * names it (`displayName` in build/plugins/setup.js's `homeSource`). Its
 * pages live in the root URL space rather than under the group's name, so
 * its nav link is the app's root.
 */
export declare const HOME_GROUP = "Home";
export declare function isPageTree(x: Page | PageTree): x is PageTree;
export declare function isIndex(x: Page | PageTree): boolean;
export declare function getIndexPage(x: PageTree): Page | undefined;
/**
 * URLs are conventionally case-insensitive; path/route matching in this
 * library follows that convention rather than treating paths as opaque,
 * case-sensitive strings.
 */
export declare function equalsIgnoreCase(a: string, b: string): boolean;
/**
 * Whether two paths name the same page: paths with and without the
 * `.md` extension are the same page (both are visitable).
 */
export declare function samePagePath(a: string, b: string): boolean;
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
export declare function isOwner(x: unknown): x is Owner;
export declare function isNonNullableObject(x: unknown): x is NonNullable<object>;
/**
 * Can receive the class instance or the owner itself, and will always return return the owner.
 *
 * undefined will be returned if the Owner does not exist on the passed object
 *
 * Can be useful when combined with `createStore` to then create "services",
 * which don't require string lookup.
 */
export declare function findOwner(contextOrOwner: unknown): Owner | undefined;
export declare function forceFindOwner(contextOrOwner: unknown): Owner;
export declare function lru<Value, Key = unknown>(key: Key, compute: (key: Key) => Value): Value;
//# sourceMappingURL=utils.d.ts.map