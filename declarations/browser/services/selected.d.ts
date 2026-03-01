import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
export declare function selected(context: unknown): Selected;
type File = {
    default: string | ComponentLike;
};
type Loader = () => Promise<File>;
declare class Selected {
    #private;
    router: RouterService;
    compiledDocs: Record<string, Loader>;
    get loader(): import("reactiveweb/get-promise-state").State<ComponentLike | undefined> | undefined;
    /*********************************************************************
     * This is a pattern to help reduce flashes of content during
     * the intermediate states of the above request fetchers.
     * When a new request starts, we'll hold on the old value for as long as
     * we can, and only swap out the old data when the new data is done loading.
     *
     ********************************************************************/
    activeCompiled: import("reactiveweb/get-promise-state").State<ComponentLike | undefined> | undefined;
    get prose(): ComponentLike | undefined;
    get isReady(): boolean;
    get isPending(): boolean;
    get hasError(): boolean;
    get error(): string;
    get hasProse(): boolean;
}
export {};
//# sourceMappingURL=selected.d.ts.map