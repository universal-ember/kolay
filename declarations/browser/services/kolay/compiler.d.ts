import Service from '@ember/service';
import { CompileState } from './compiler/compile-state.ts';
import type DocsService from './docs.ts';
export default class Compiler extends Service {
    docs: DocsService;
    last?: CompileState;
    compileMD: (code: string | undefined | null) => CompileState;
}
//# sourceMappingURL=compiler.d.ts.map