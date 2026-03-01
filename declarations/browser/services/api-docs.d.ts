import type { LoadTypedoc } from '../../types.ts';
export declare function typedocLoader(context: unknown): DocsLoader;
declare class DocsLoader {
    _packages: string[];
    loadApiDocs: LoadTypedoc;
    get packages(): string[];
    load: (name: string) => Promise<Response>;
}
export {};
//# sourceMappingURL=api-docs.d.ts.map