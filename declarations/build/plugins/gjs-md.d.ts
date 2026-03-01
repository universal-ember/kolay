/**
 * @porom {Options} options
 */
export function createCompiler(options: any): any;
/**
 * @param {string} input
 * @param {{ compiler: unknown; virtualModulesByMarkdownFile: unknown; id: string; scope?: string }} options
 * @return {Promise<{ code: string, map: unknown }>}
 */
export function mdToGJS(input: string, { compiler, virtualModulesByMarkdownFile, id, scope }: {
    compiler: unknown;
    virtualModulesByMarkdownFile: unknown;
    id: string;
    scope?: string;
}): Promise<{
    code: string;
    map: unknown;
}>;
/**
 * @typedof {Object} CodeBlock
 * @property {string} format
 * @property {string} code
 * @property {string} placeholderId
 */
/**
 * Build/Vite plugin for authoring markdown with live code fences
 * to be compiled to GJS during build.
 *
 * @typedef {Object} Options
 * @property {unknown[]} [remarkPlugins] - Array of remark plugins to use.
 * @property {unknown[]} [rehypePlugins] - Array of rehype plugins to use.
 * @property {string} [scope] - functions, components, or values to expose in markdown
 *
 * @param {Options} options - Plugin options.
 */
export function gjsmd(options?: Options): ({
    name: string;
    resolveId: {
        filter: {
            id: RegExp;
        };
        handler(id: any, parent: any): Promise<string>;
    };
    load: {
        filter: {
            id: RegExp;
        };
        handler(id: any): Promise<{
            code: string;
            map: string;
        }>;
    };
    /**
     * We need to run before babel *and* embroider's gjs processing.
     * */
    enforce?: undefined;
} | {
    name: string;
    /**
     * We need to run before babel *and* embroider's gjs processing.
     * */
    enforce: string;
    load: {
        filter: {
            id: {
                include: any[];
                exclude: any[];
            };
        };
        handler(id: any): Promise<any>;
    };
    resolveId?: undefined;
})[];
/**
 * Build/Vite plugin for authoring markdown with live code fences
 * to be compiled to GJS during build.
 */
export type Options = {
    /**
     * - Array of remark plugins to use.
     */
    remarkPlugins?: unknown[] | undefined;
    /**
     * - Array of rehype plugins to use.
     */
    rehypePlugins?: unknown[] | undefined;
    /**
     * - functions, components, or values to expose in markdown
     */
    scope?: string | undefined;
};
//# sourceMappingURL=gjs-md.d.ts.map