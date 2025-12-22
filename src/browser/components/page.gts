import Component from '@glimmer/component';

import { selected } from '../services/kolay/selected.ts';

import type { ComponentLike } from '@glint/template';

export class Page extends Component<{
  Blocks: {
    /**
     * If there was a compilation error, the `<:error>` block
     * will be active and pass the caller the error text from the compiler.
     *
     * Example:
     *
     * ```gjs
     * import { Page } from 'kolay/components';
     *
     * <template>
     *   <Page>
     *     <:error as |errorText|>
     *
     *       {{errorText}}
     *
     *     </:error>
     *     <:success></:success>
     *   </Page>
     * </template>
     * ```
     */
    error: [error: string];

    /**
     * Before the document is compiled (or errored), this block will be active.
     *
     * Example:
     *
     * ```gjs
     * import { Page } from 'kolay/components';
     *
     * <template>
     *   <Page>
     *     <:pending>
     *        Loading State
     *     </:pending>
     *     <:success></:success>
     *   </Page>
     * </template>
     * ```
     */
    pending: [];

    /**
     * If compilation of the active page was successful, the `<:success>` black
     * will be active, and will pass the component reference to the caller.
     *
     * Example:
     * ```gjs
     * import { Page } from 'kolay/components';
     *
     * <template>
     *   <Page>
     *     <:error></:error>
     *     <:success as |prose|>
     *
     *       <prose />
     *
     *     </:success>
     *   </Page>
     * </template>
     * ```
     */
    success: [prose: ComponentLike];
  };
}> {
  <template>
    {{#if this.selected.hasError}}
      {{yield this.selected.error to='error'}}
    {{/if}}

    {{#if this.selected.isPending}}
      {{yield to='pending'}}
    {{/if}}

    {{#if this.selected.prose}}
      {{yield this.selected.prose to='success'}}
    {{/if}}
  </template>

  private get selected() {
    return selected(this);
  }
}

export default Page;
