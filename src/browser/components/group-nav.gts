import Component from '@glimmer/component';
import { service } from '@ember/service';

import { HOME_GROUP } from '../../nav.js';
import { docsManager } from '../services/docs.ts';

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

  /**
   * One link per top-level nav entry: a group, or a group that collects
   * others (whose links it replaces). The docs service computes the
   * entries and their URLs — scoped mounts
   * (`addRoutes(context, groupName)`) live at their own URL, not at
   * /GroupName, and a group that collects others links at its first group
   * with pages.
   *
   * The co-located pages are the exception: they are a group ('Home'), but
   * they live in the root URL space rather than under their name, so the
   * link is the app's root, and `@homeName` names it.
   */
  get entries() {
    return this.#docs.navEntries.map((entry) => {
      const isHome = entry.name === HOME_GROUP;

      return {
        name: entry.name,
        text: isHome ? this.homeName : entry.name,
        href: isHome ? this.rootURL : entry.href,
      };
    });
  }

  isActive = (name: string) => {
    // The entry is derived from the URL by the docs service (rootURL-aware),
    // rather than comparing the group name against currentURL directly
    // (which always failed: 'Docs' never prefixes '/Docs/...').
    // A collected group's page keeps the collecting entry active.
    return this.#docs.activeNavEntry?.name === name;
  };

  get activeClass() {
    return this.args.activeClass ?? 'active';
  }

  <template>
    <nav aria-label='Groups' ...attributes>
      <ul>
        {{#each this.entries as |entry|}}
          <li>
            <a href={{entry.href}} class={{if (this.isActive entry.name) this.activeClass}}>

              {{#if (has-block)}}
                {{yield entry.text}}
              {{else}}
                {{entry.text}}
              {{/if}}

            </a>
          </li>
        {{/each}}
      </ul>
    </nav>
  </template>
}
