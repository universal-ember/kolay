import type { ComponentLike } from '@glint/template';
export declare class CompileState {
    #private;
    isCompiling: boolean;
    error: null | string;
    component: ComponentLike<{}> | undefined;
    constructor();
    then: (...args: [((value: ComponentLike) => ComponentLike | PromiseLike<ComponentLike>) | null | undefined]) => Promise<ComponentLike>;
    success: (component: ComponentLike) => void;
    fail: (error: string) => void;
    get isReady(): boolean;
}
//# sourceMappingURL=compile-state.d.ts.map