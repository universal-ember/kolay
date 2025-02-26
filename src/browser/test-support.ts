import type Owner from '@ember/owner';
import type { setupTest } from 'ember-qunit';
import type { setupKolay as setup } from 'kolay/setup';

type Options = Parameters<typeof setup>[1];
type NestedHooks = Parameters<typeof setupTest>[0];

export function setupKolay(hooks: NestedHooks, config?: () => Promise<Options>): void {
  hooks.beforeEach(async function () {
    const docs = this.owner.lookup('service:kolay/docs');

    const userConfig = config ? await config() : {};

    // TODO: figure this out later
    await docs.setup(userConfig as any);
  });
}

/**
 * For changing which sub-context is loaded as the primary set of docs
 *
 * @param {{ owner: { lookup: (registryName: string) => any }}} context
 */
export function selectGroup(context: object, groupName = 'root'): void {
  const docs = (context as { owner: Owner }).owner.lookup('service:kolay/docs');

  docs.selectGroup(groupName);
}
