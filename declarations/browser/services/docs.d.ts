import { Shadowed } from 'ember-primitives/components/shadowed';
import { type ModuleMap, type ScopeMap } from 'ember-repl';
import type { LoadTypedoc, Manifest, Page } from '../../types.ts';
import type { ComponentLike } from '@glint/template';
export type SetupOptions = Parameters<DocsService['setup']>[0];
export declare function docsManager(context: unknown): DocsService;
export declare const LOAD_MANIFEST: unique symbol;
export declare const PREPARE_DOCS: unique symbol;
export declare function compilerOptions({ rootURL, topLevelScope, remarkPlugins, rehypePlugins, modules, }?: {
    /**
     * The app's rootURL, so authored root-absolute URLs are rebased onto it.
     * Accepts a getter for callers that build options before the rootURL is
     * known. At the default '/', rebasing is a no-op.
     */
    rootURL?: string | (() => string);
    topLevelScope?: ScopeMap;
    modules?: ModuleMap;
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
}): {
    options: {
        md: {
            remarkPlugins: unknown[];
            rehypePlugins: unknown[] | undefined;
        };
        gmd: {
            remarkPlugins: unknown[];
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
/**
 * The store `docsManager(context)` returns: the manifest, the current
 * group, and helpers for resolving pages and building hrefs.
 */
declare class DocsService {
    #private;
    private router;
    private get apiDocs();
    private _docs;
    /**
     * Wires the loaded docs modules into the store.
     * The generated `setupKolay` calls this — apps rarely call it directly.
     */
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
                default: string | ComponentLike;
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
    /**
     * Internal wiring shared by `setup` and the test-support helpers.
     *
     * @private
     */
    [PREPARE_DOCS](apiDocs: {
        packageNames: string[];
        loadApiDocs: LoadTypedoc;
    } | undefined, compiledDocs: {
        manifest: Manifest;
        pages: Record<string, () => Promise<{
            default: string | ComponentLike;
        }>>;
    } | undefined): void;
    private get docs();
    /**
     * The loaded manifest: the app's `base` (rootURL) and every group.
     */
    get manifest(): Manifest;
    /**
     * The flat list of all pages for the current group.
     * Each page knows the name of its immediate parent.
     */
    get pages(): Page[];
    /**
     * The full page hierachy for the current group.
     */
    get tree(): import("../index.ts").Collection;
    /**
     * The name of the group currently being viewed.
     *
     * The first URL segment names the group — unless the current route is
     * inside a scoped mount (`addRoutes(context, groupName)`), in which
     * case the mount decides.
     */
    get selectedGroup(): string | undefined;
    /**
     * The manifest's own casing for a group name, matched case-insensitively —
     * URLs are conventionally case-insensitive, but hrefs / `urlFor` need the
     * manifest's casing.
     */
    canonicalGroupName: (name: string) => string | undefined;
    /**
     * When inside a scoped mount, the manifest-space path of the visited
     * page (the mount's URL space differs from the manifest's).
     */
    get scopedPagePath(): string | undefined;
    /**
     * The URL to link to for a page: its manifest path — unless the page's
     * group is mounted via a scoped `addRoutes(context, groupName)`, in which
     * case the mount decides. Includes the rootURL, like `page.path`.
     */
    hrefFor: (page: Page) => string;
    /**
     * Like `hrefFor`, without the rootURL — the space `router.currentURL`
     * and `transitionTo` operate in.
     */
    appRelativeHrefFor: (page: Page) => string;
    /**
     * The URL a group's nav link should point at: `/GroupName` — unless the
     * group is mounted via a scoped `addRoutes(context, groupName)`, in which
     * case the mount's own URL. Includes the rootURL.
     */
    groupHrefFor: (groupName: string) => string;
    /**
     * Navigate to a group's first page (or its mount's own URL, for a
     * scoped mount).
     */
    selectGroup: (group: string) => void;
    /**
     * Every group's name, in manifest order.
     */
    get availableGroups(): string[];
    /**
     * The manifest entry for `selectedGroup`.
     */
    get currentGroup(): {
        name: string;
        list: Page[];
        tree: import("../index.ts").Collection;
    };
    /**
     * The manifest entry for a group, by name. Asserts if the group
     * doesn't exist.
     */
    groupFor: (groupName: string | undefined) => {
        name: string;
        list: Page[];
        tree: import("../index.ts").Collection;
    };
    /**
     * Will return false if a url doesn't exist in any group,
     * or the name of the group that contains the page if the url does exist.
     */
    groupForURL: (url: string) => false | string;
    /**
     * Returns the page entry for the current group.
     * Takes an app-relative path (the space `router.currentURL` is in),
     * with or without the `.md` extension.
     */
    findByPath: (path: string) => Page | undefined;
}
export type { DocsService };
//# sourceMappingURL=docs.d.ts.map