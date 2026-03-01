import { Shadowed } from 'ember-primitives/components/shadowed';
import { type ModuleMap, type ScopeMap } from 'ember-repl';
import type { LoadManifest, LoadTypedoc, Manifest } from '../../types.ts';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
export type SetupOptions = Parameters<DocsService['setup']>[0];
export declare function docsManager(context: unknown): DocsService;
export declare const LOAD_MANIFEST: unique symbol;
export declare const PREPARE_DOCS: unique symbol;
export declare function compilerOptions({ topLevelScope, remarkPlugins, rehypePlugins, modules, }?: {
    topLevelScope?: ScopeMap;
    modules?: ModuleMap;
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
}): {
    options: {
        md: {
            remarkPlugins: unknown[] | undefined;
            rehypePlugins: unknown[] | undefined;
        };
        gmd: {
            remarkPlugins: unknown[] | undefined;
            rehypePlugins: unknown[] | undefined;
            scope: {
                Shadowed: typeof Shadowed;
                APIDocs: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                CommentQuery: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                ComponentSignature: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                ModifierSignature: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                HelperSignature: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
            };
        };
        hbs: {
            scope: {
                Shadowed: typeof Shadowed;
                APIDocs: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                CommentQuery: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                ComponentSignature: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                ModifierSignature: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
                HelperSignature: import("@ember/component/template-only").TOC<{
                    Args: {
                        module: string;
                        name: string;
                        package: string;
                    };
                }>;
            };
        };
    };
    modules: {
        kolay: () => Promise<typeof import("../index.ts")>;
        'kolay/components': () => Promise<typeof import("../components.ts")>;
        'kolay/typedoc': () => Promise<typeof import("../typedoc/index.ts")>;
    };
};
declare class DocsService {
    #private;
    router: RouterService;
    private get apiDocs();
    _docs: Manifest | undefined;
    loadManifest: LoadManifest;
    setup: (options: {
        /**
         * The module of the api docs virtual module.
         * This should be set to `await import('kolay/api-docs:virtual')
         */
        apiDocs?: Promise<{
            packageNames: string[];
            loadApiDocs: LoadTypedoc;
        }>;
        /**
         * The module of the compiled docs virtual module.
         * This should be set to `await import('kolay/compiled-docs:virtual')
         */
        compiledDocs?: {
            manifest: Manifest;
            pages: Record<string, () => Promise<{
                default: ComponentLike;
            }>>;
        };
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
        modules?: ModuleMap;
        /**
         * Provide additional remark plugins to the default markdown compiler.
         *
         * These can be used to add features like notes, callouts, footnotes, etc
         */
        remarkPlugins?: unknown[];
        /**
         * Provide additional rehype plugins to the default html compiler.
         *
         * These can be used to add features syntax-highlighting to pre elements, etc
         */
        rehypePlugins?: unknown[];
    }) => Promise<Manifest>;
    [PREPARE_DOCS](apiDocs: {
        packageNames: string[];
        loadApiDocs: LoadTypedoc;
    } | undefined, compiledDocs: {
        manifest: Manifest;
        pages: Record<string, () => Promise<{
            default: ComponentLike;
        }>>;
    } | undefined): void;
    get docs(): Manifest;
    get manifest(): Manifest;
    /**
     * The flat list of all pages for the current group.
     * Each page knows the name of its immediate parent.
     */
    get pages(): import("../index.ts").Page[];
    /**
     * The full page hierachy for the current group.
     */
    get tree(): import("../index.ts").Collection;
    /**
     * We use the URL for denoting which group we're looking at.
     * The first segment of the URL will either be a group,
     * or part of the path segment on the root namespace.
     *
     * This does open us up for collisions, so maybe
     * we'll need to alias "root" with something, or at
     * the very least not use a non-path segement for it.
     */
    get selectedGroup(): string | undefined;
    selectGroup: (group: string) => void;
    get availableGroups(): string[];
    get currentGroup(): {
        name: string;
        list: import("../index.ts").Page[];
        tree: import("../index.ts").Collection;
    };
    groupFor: (groupName: string | undefined) => {
        name: string;
        list: import("../index.ts").Page[];
        tree: import("../index.ts").Collection;
    };
    /**
     * Will return false if a url doesn't exist in any group,
     * or the name of the group that contains the page if the url does exist.
     */
    groupForURL: (url: string) => false | string;
    /**
     * Returns the page entry for the current group
     */
    findByPath: (path: string) => import("../index.ts").Page | undefined;
}
export {};
//# sourceMappingURL=docs.d.ts.map