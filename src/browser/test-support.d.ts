import type { setupKolay as setup } from './virtual/setup.d.ts';
import type QUnit from 'qunit';

type Options = Parameters<typeof setup>[1];

type NestedHooks = Parameters<NonNullable<Parameters<QUnit['module']>[1]>>[0];

export function setupKolay(hooks: NestedHooks, config: () => Promise<Options>): void;

export function selectGroup(context: object, groupName: string): void;
