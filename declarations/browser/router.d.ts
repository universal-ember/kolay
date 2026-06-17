import type { RouterDSL } from '@ember/-internals/routing';
import type Transition from '@ember/routing/transition';
export declare function addRoutes(context: Pick<RouterDSL, 'route'>): void;
/**
 * Does our target destination exist? if not,
 * redirect to the first page on the namespace
 *
 * For use with addRoutes(), which defines a "page" path matcher
 */
export declare function handlePotentialIndexVisit(context: object, transition: Transition): void;
//# sourceMappingURL=router.d.ts.map