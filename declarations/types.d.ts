import type Owner from '@ember/owner';
export interface Secret {
    owners: Set<Owner>;
}
export type LoadManifest = () => Promise<Manifest>;
export type LoadTypedoc = Record<string, () => ReturnType<typeof fetch>>;
export interface Manifest {
    groups: {
        name: string;
        list: Page[];
        tree: Collection;
    }[];
}
export interface Collection {
    path: string;
    name: string;
    first?: string;
    pages: (Collection | Page)[];
    groupName?: never;
}
export interface Page {
    path: string;
    name: string;
    groupName: string;
    cleanedName: string;
}
/**
 * @public
 */
export interface Options {
    /**
     * The source directory for where to look for files to include in  the build and create the manifest from.
     * This is relative to the CWD.
     * Note that only md, json, and jsonc files are used.
     *
     * This option is the same as the one in `groups`, but is a shorthand for if
     * you only have one set of docs with no configuration needed.
     */
    src?: string | undefined;
    /**
     * Additional markdown sources to include
     * These will be copied into your dist directory, and will be grouped by each entry's "name" property
     *
     * default value: `[ { name: 'Home', static: './{app,src}/templates/\*\*\/\*.gjs.md' } ]`
     */
    groups?: {
        name: string;
        /**
         * Glob for finding .gjs.md files.
         * These will be built as part of the app build,
         * and will not be deferred to runtime.
         */
        static: string;
    } | {
        /**
         * The name of the group
         */
        name: string;
        /**
         * The source directory for where to look for files to include in  the build and create the manifest from.
         * This is relative to the CWD.
         * Note that only md, json, and jsonc files are used.
         */
        src: string;
        /**
         * Only generate a manifest of directories.
         * This ignores all of the files on disk, useful if you have many
         * convention-based file names and some other means of enforcing that they all exist.
         * (such as runtime testing)
         */
        onlyDirectories?: boolean;
    }[];
    /**
     * List of packages to generate api docs for
     */
    packages: string[];
    /**
     * The name of the file that is written.
     * Defaults to 'manifest.json'
     */
    name?: string | undefined;
    /**
     * Where to place the manifest
     * Defaults to 'docs'
     */
    dest?: string | undefined;
}
export type Node = Page | Collection;
/**
 * @internal
 */
export type GatheredDocs = Array<{
    mdPath: string;
    config?: object;
}>;
/**
 * @internal
 */
export interface MarkdownPagesOptions {
    src?: string | undefined;
    groups: {
        name: string;
        src: string;
        onlyDirectories?: boolean;
        /**
         * @internal
         * Globby glob to find paths
         * Defaults to all, **\/*
         */
        include?: string;
        /**
         * @internal
         * Array of exclusion patterns. Will filter out the anything found by the include pattern.
         * default: []
         */
        exclude?: string[];
    }[];
    name?: string | undefined;
    dest?: string | undefined;
}
/**
 * @internal
 */
export interface APIDocsOptions {
    packages: string[];
    dest?: string | undefined;
}
//# sourceMappingURL=types.d.ts.map