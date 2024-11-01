import Component from '@glimmer/component';
import { service } from '@ember/service';

import type DocsService from '../services/kolay/docs.ts';
import type RouterService from '@ember/routing/router-service';

export class GroupNav extends Component<{
  /**
   * The `<nav>` element. It has a default `aria-label` of "Groups".
   * Normally an `aria-label` is not required,
   * but when there are multiple `<nav>` elements on a screen, it is required.
   */
  Element: HTMLElement;
  Args: {
    /**
     * The class to apply to the `<a>` element when its link is active.
     *
     * Defaults to "active"
     */
    activeClass?: string;
    /**
     * The text to use for the "/" link.
     *
     * Defaults to "Home".
     * This type of link is commonly set to the library name.
     */
    homeName?: string;
  };
  Blocks: {
    /**
     * If you'd like to customize how the links are formatted,
     * you may pass a block which which will have the name of each link
     * yielded to it.
     *
     * Example:
     * ```gjs
     * import { GroupNav } from 'kolay/components';
     *
     * const format = text => text.toUpperCase();
     *
     * <template>
     *   <GroupNav as |name|>
     *     {{format name}}
     *   </GroupNav>
     * </template>
     * ```
     */
    default: [name: string];
  };
}> {
  @service('kolay/docs') declare docs: DocsService;
  @service declare router: RouterService;

  get homeName() {
    return this.args.homeName ?? 'Home';
  }

  get groups() {
    return this.docs.availableGroups.map((groupName) => {
      if (groupName === 'root') return { text: this.homeName, value: '/' };

      return { text: groupName, value: `/${groupName}` };
    });
  }

  isActive = (subPath: string) => {
    if (subPath === '/') return false;

    return this.router.currentURL?.startsWith(subPath);
  };

  get activeClass() {
    return this.args.activeClass ?? 'active';
  }

  <template>
    <nav aria-label='Groups' ...attributes>
      <ul>
        {{#each this.groups as |group|}}
          <li>
            <a
              href={{group.value}}
              class={{if (this.isActive group.value) this.activeClass}}
            >

              {{#if (has-block)}}
                {{yield group.text}}
              {{else}}
                {{group.text}}
              {{/if}}

            </a>
          </li>
        {{/each}}
      </ul>
    </nav>
  </template>
}
