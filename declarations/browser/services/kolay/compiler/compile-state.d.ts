import type { ComponentLike } from '@glint/template';
export declare class CompileState {
    #private;
    isCompiling: boolean;
    error: null | string;
    component: ComponentLike<{}> | undefined;
    constructor();
    then: (args_0: ((value: ComponentLike) => ComponentLike | PromiseLike<ComponentLike>) | null | undefined) => Promise<ComponentLike>;
    success: (component: ComponentLike) => void;
    fail: (error: string) => void;
    get isReady(): boolean;
}
