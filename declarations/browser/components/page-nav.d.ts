import Component from '@glimmer/component';
import type { Collection, Page } from '../../types.ts';
import type { ComponentLike } from '@glint/template';
export declare class PageNav extends Component<{
    /**
     * The `<nav>` element. It has a default `aria-label` of "Selected Group".
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
    };
    Blocks: {
        /**
         * If provided, this block will yield back the page for customizing the name and element.
         * By default the `name` property will be used in a link.
         *
         * Example:
         * ```gjs live preview
         * import { PageNav } from 'kolay/components';
         * import { nameFor } from '#docs/demo-support';
         *
         * <template>
         *   <PageNav>
         *     <:page as |x|>
         *       <pre>{{JSON.stringify x.page null 3}}</pre>
         *       <page.Link>
         *         {{nameFor x.page}}
         *       </page.Link>
         *     </:page>
         *   </PageNav>
         *   <style>@scope { pre { max-height: 200px; } ul { display: grid; }}</style>
         * </template>
         * ```
         */
        page: [
            {
                page: Page;
                Link: ComponentLike<{
                    Element: HTMLAnchorElement;
                    Blocks: {
                        default: [page: Page, isActive: boolean];
                    };
                }>;
            }
        ];
        /**
         * If provided, this block will yield back the collection for customizing the name.
         * By default the `name` property will be used or a link will be rendered if an index page is present..
         *
         * Example:
         * ```gjs live preview
         * import { PageNav } from 'kolay/components';
         * import { sentenceCase } from '#docs/demo-support';
         *
         * <template>
         *   <PageNav>
         *     <:collection as |x|>
         *       <pre>{{JSON.stringify x null 3}}</pre>
         *       {{#if x.index}}
         *         <x.index.Link>
         *           {{sentenceCase x.collection.name}}
         *         </x.index.Link>
         *       {{else}}
         *         {{sentenceCase x.collection.name}}
         *       {{/if}}
         *     </:collection>
         *   </PageNav>
         *   <style>@scope { pre { max-height: 200px; } ul { display: grid; }}</style>
         * </template>
         * ```
         */
        collection: [
            {
                collection: Collection;
                /**
                 * If there is an index page, it'll be provided here,
                 * and omitted from the :page block.
                 */
                index?: {
                    page: Page;
                    Link: ComponentLike<{
                        Element: HTMLAnchorElement;
                        Blocks: {
                            default: [page: Page, isActive: boolean];
                        };
                    }>;
                };
            }
        ];
    };
}> {
    private get docs();
}
//# sourceMappingURL=page-nav.d.ts.map