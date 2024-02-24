import type { SetupOptions } from '../services/kolay/docs.ts';
import type Owner from '@ember/owner';
import type QUnit from 'qunit';

type NestedHooks = Parameters<NonNullable<Parameters<QUnit['module']>[1]>>[0];

export function setupKolay(
  hooks: NestedHooks,
  config: () => Promise<SetupOptions>,
) {
  hooks.beforeEach(async function (this: { owner: Owner }) {
    let docs = this.owner.lookup('service:kolay/docs');

    docs.setup(await config());
  });
}
