import Component from '@glimmer/component';
import { service } from '@ember/service';

import { docsManager } from '../services/docs.ts';
import { HOME_GROUP } from '../utils.ts';

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
  get #docs() {
    return docsManager(this);
  }

  @service declare router: RouterService;

  get homeName() {
    return this.args.homeName ?? 'Home';
  }

  get rootURL() {
    return this.router.rootURL;
  }

  get groups() {
    return this.#docs.availableGroups.map((groupName) => {
      // The co-located pages are a group, but they live in the root URL
      // space rather than under their name, so the link is the app's root
      // and `@homeName` names it.
      if (groupName === HOME_GROUP) {
        return { text: this.homeName, value: HOME_GROUP, href: this.rootURL };
      }

      return {
        text: groupName,
        value: groupName,
        // scoped mounts (addRoutes(context, groupName)) live at their own
        // URL, not at /GroupName
        href: this.#docs.groupHrefFor(groupName),
      };
    });
  }

  isActive = (groupName: string) => {
    // The group is derived from the URL by the docs service (rootURL-aware),
    // rather than comparing the group name against currentURL directly
    // (which always failed: 'Docs' never prefixes '/Docs/...').
    return this.#docs.selectedGroup === groupName;
  };

  get activeClass() {
    return this.args.activeClass ?? 'active';
  }

  <template>
    <nav aria-label='Groups' ...attributes>
      <ul>
        {{#each this.groups as |group|}}
          <li>
            <a href={{group.href}} class={{if (this.isActive group.value) this.activeClass}}>

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
