import Component from '@glimmer/component';
import { service } from '@ember/service';

import type SelectedService from '../services/kolay/selected.ts';
import type { ComponentLike } from '@glint/template';

export class Page extends Component<{
  Blocks: {
    error: [error: string];
    success: [prose: ComponentLike<{ }>];
  }
}> {
  <template>
    {{#if this.selected.hasError}}
      {{yield this.selected.error to="error"}}
    {{/if}}

    {{#if this.selected.prose}}
      {{yield this.selected.prose to="success"}}
    {{/if}}
  </template>

  @service('kolay/selected') declare selected: SelectedService;
}

export default Page;
