import APIDocs from './services/kolay/api-docs.ts';
import Compiler from './services/kolay/compiler.ts';
import Docs from './services/kolay/docs.ts';
import Selected from './services/kolay/selected.ts';
export declare function registry(prefix: string): {
    readonly [x: string]: typeof APIDocs | typeof Compiler | typeof Selected | typeof Docs;
};
//# sourceMappingURL=service-registry.d.ts.map