import Component from '@glimmer/component';
import type RouterService from '@ember/routing/router-service';
export declare class GroupNav extends Component<{
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
    #private;
    router: RouterService;
    get homeName(): string;
    get rootURL(): string;
    get groups(): {
        text: string;
        value: string;
    }[];
    isActive: (subPath: string) => boolean | undefined;
    get activeClass(): string;
}
//# sourceMappingURL=group-nav.d.ts.map