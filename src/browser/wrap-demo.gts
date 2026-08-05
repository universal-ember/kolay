import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';

import { createStore } from 'ember-primitives/store';

import { findKey } from './services/lazy-load.ts';

import type { ComponentLike } from '@glint/template';

/**
 * The shape of the component `setupKolay({ wrapDemo })` accepts:
 * it receives each demo as its default block.
 */
export type DemoWrapper = ComponentLike<{ Blocks: { default: [] } }>;

class WrapperState {
  @tracked component: DemoWrapper | undefined;
}

/**
 * Stores the app's demo wrapper. The wrapper is global (demos render under
 * multiple owners) — `setupKolay({ wrapDemo })` calls this for you; it is
 * only exported for custom setups.
 */
export function setDemoWrapper(component: DemoWrapper | undefined): void {
  const owner = findKey();

  assert(
    `Cannot set a demo wrapper before setupKolay has run — ` +
      `pass wrapDemo to setupKolay, or call setDemoWrapper after it.`,
    owner || !component
  );

  if (!owner) return;

  createStore(owner, WrapperState).component = component;
}

/**
 * Wraps a rendered demo (live code fence) in the component the app provided
 * via `setupKolay({ wrapDemo })`. With none provided, renders the demo
 * unchanged.
 *
 * Both markdown pipelines invoke this around every demo placeholder
 * automatically — authors don't use it directly.
 */
export class WrapDemo extends Component<{ Blocks: { default: [] } }> {
  get wrapper(): DemoWrapper | undefined {
    const owner = findKey();

    if (!owner) return;

    return createStore(owner, WrapperState).component;
  }

  <template>
    {{#if this.wrapper}}
      <this.wrapper>{{yield}}</this.wrapper>
    {{else}}
      {{yield}}
    {{/if}}
  </template>
}
