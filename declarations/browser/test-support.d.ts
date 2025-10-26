import type { setupTest } from 'ember-qunit';
import type { setupKolay as setup } from 'kolay/setup';
type Options = Parameters<typeof setup>[1];
type NestedHooks = Parameters<typeof setupTest>[0];
export declare function setupKolay(hooks: NestedHooks, config?: () => Promise<Options>): void;
/**
 * For changing which sub-context is loaded as the primary set of docs
 *
 * @param {{ owner: { lookup: (registryName: string) => any }}} context
 */
export declare function selectGroup(context: object, groupName?: string): void;
export {};
//# sourceMappingURL=test-support.d.ts.map