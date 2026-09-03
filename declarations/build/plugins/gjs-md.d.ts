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
 * Each usage's options may configure:
 * - remarkPlugins - Array of remark plugins to use.
 * - rehypePlugins - Array of rehype plugins to use.
 * - scope - functions, components, or values to expose in markdown
 *
 * @param {{ options: object, usages: object[], isPrimary: boolean }} state - this usage's coordination state.
 */
export function gjsmd(state: {
    options: object;
    usages: object[];
    isPrimary: boolean;
}): ({
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
    /**
     * Unlike setup.js, these plugin entries reach vite as raw plugins
     * (nested array), so the hook lives directly on the object rather
     * than under a `vite` key.
     */
    configResolved?: undefined;
} | {
    name: string;
    /**
     * We need to run before babel *and* embroider's gjs processing.
     * */
    enforce: string;
    /**
     * Unlike setup.js, these plugin entries reach vite as raw plugins
     * (nested array), so the hook lives directly on the object rather
     * than under a `vite` key.
     */
    configResolved(resolvedConfig: any): void;
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
//# sourceMappingURL=gjs-md.d.ts.map