import Service from '@ember/service';
import type { Manifest } from '../../../types.ts';
import type ApiDocs from './api-docs.ts';
import type Selected from './selected.ts';
import type RouterService from '@ember/routing/router-service';
import type { UnifiedPlugin } from 'ember-repl';
export type SetupOptions = Parameters<DocsService['setup']>[0];
interface ResolveMap {
    [moduleName: string]: ScopeMap;
}
interface ScopeMap {
    [identifier: string]: unknown;
}
export default class DocsService extends Service {
    router: RouterService;
    selected: Selected;
    apiDocs: ApiDocs;
    additionalResolves?: ResolveMap;
    additionalTopLevelScope?: ScopeMap;
    remarkPlugins?: UnifiedPlugin[];
    rehypePlugins?: UnifiedPlugin[];
    _docs: Manifest | undefined;
    loadManifest: () => Promise<Manifest>;
    setup: (options: {
        /**
         * The module of the manifest virtual module.
         * This should be set to `await import('kolay/manifest:virtual')
         */
        manifest?: Promise<any>;
        /**
         * The module of the api docs virtual module.
         * This should be set to `await import('kolay/api-docs:virtual')
         */
        apiDocs?: Promise<any>;
        /**
         * Additional invokables that you'd like to have access to
         * in the markdown, without a codefence.
         *
         * By default, the fallowing is available:
         * - for escaping styles / having a clean style-sandbox
         *   - <Shadowed>
         * - for rendering your typedoc:
         *   - <APIDocs>
         *   - <ComponentSignature>
         */
        topLevelScope?: ScopeMap;
        /**
         * Additional modules you'd like to be able to import from.
         * This is in addition the the default modules provided by ember,
         * and allows you to have access to private libraries without
         * needing to publish those libraries to NPM.
         */
        resolve?: {
            [moduleName: string]: Promise<ScopeMap>;
        };
        /**
         * Provide additional remark plugins to the default markdown compiler.
         *
         * These can be used to add features like notes, callouts, footnotes, etc
         */
        remarkPlugins?: UnifiedPlugin[];
        /**
         * Provide additional rehype plugins to the default html compiler.
         *
         * These can be used to add features syntax-highlighting to pre elements, etc
         */
        rehypePlugins?: UnifiedPlugin[];
    }) => Promise<Manifest>;
    get docs(): Manifest;
    get manifest(): Manifest;
    /**
     * The flat list of all pages.
     * Each page knows the name of its immediate parent.
     */
    get pages(): import("../../../types.ts").Page[];
    /**
     * The full page hierachy
     */
    get tree(): import("../../../types.ts").Collection;
    /**
     * We use the URL for denoting which group we're looking at.
     * The first segment of the URL will either be a group,
     * or part of the path segment on the root namespace.
     *
     * This does open us up for collisions, so maybe
     * we'll need to alias "root" with something, or at
     * the very least not use a non-path segement for it.
     */
    get selectedGroup(): string;
    selectGroup: (group: string) => void;
    get availableGroups(): string[];
    get currentGroup(): {
        name: string;
        list: import("../../../types.ts").Page[];
        tree: import("../../../types.ts").Collection;
    };
    groupFor: (groupName: string) => {
        name: string;
        list: import("../../../types.ts").Page[];
        tree: import("../../../types.ts").Collection;
    };
    /**
     * Will return false if a url doesn't exist in any group,
     * or the name of the group that contains the page if the url does exist.
     */
    groupForURL: (url: string) => false | string;
}
declare module '@ember/service' {
    interface Registry {
        'kolay/docs': DocsService;
    }
}
export {};
//# sourceMappingURL=docs.d.ts.map