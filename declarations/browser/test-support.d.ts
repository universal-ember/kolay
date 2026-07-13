import type { setupTest } from 'ember-qunit';
import type { setupKolay as setup } from 'kolay/setup';
type Options = Parameters<typeof setup>[1];
type NestedHooks = Parameters<typeof setupTest>[0];
export declare function setupKolay(hooks: NestedHooks, config?: Options): void;
/**
 * For changing which sub-context is loaded as the primary set of docs
 *
 * @param {unknown | Owner} context - can be the owner or an object that has had setOwner applied to it.
 */
export declare function selectGroup(context: unknown, groupName?: string): void;
export {};
//# sourceMappingURL=test-support.d.ts.map