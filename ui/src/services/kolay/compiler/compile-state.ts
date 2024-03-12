import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';

import type { ComponentLike } from '@glint/template';

export class CompileState {
  @tracked isCompiling = false;
  @tracked error: null | string = null;
  @tracked component: ComponentLike<{}> | undefined;

  #promise: Promise<ComponentLike>;
  #resolve?: (value: ComponentLike) => void;
  #reject?: (value: unknown) => void;

  constructor() {
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }

  then = (...args: [((value: ComponentLike) => ComponentLike | PromiseLike<ComponentLike>) | null | undefined ]) => this.#promise.then(...args);

  success = (component: ComponentLike) => {
    assert(`Resolve is missing`, this.#resolve);
    this.#resolve(component);
    this.isCompiling = false;
    this.error = null;
  }

  fail = (error: string) => {
    assert(`Reject is missing`, this.#reject);
    this.error = error;
    this.#reject(error);
  }

  get isReady() {
    return !this.isCompiling;
  }
}
