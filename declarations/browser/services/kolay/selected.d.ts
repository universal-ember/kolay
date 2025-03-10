import Service from '@ember/service';
import { MDRequest } from './request.ts';
import type { Page } from '../../../types.ts';
import type DocsService from './docs.ts';
import type RouterService from '@ember/routing/router-service';
/**
 * Sort of like an ember-concurrency task...
 * if we ignore concurrency and only care about the states of the running function
 * (and want automatic invocation based on derivation)
 */
declare class Prose {
    private docFn;
    constructor(docFn: () => string | null);
    last: import("./compiler/compile-state.ts").CompileState;
    lastSuccessful: import("@glint/template").ComponentLike<{}> | undefined;
}
export default class Selected extends Service {
    #private;
    router: RouterService;
    docs: DocsService;
    /*********************************************************************
     * These load the files from /public and handle loading / error state.
     *
     * When the path changes for each of these, the previous request will
     * be cancelled if it was still pending.
     *******************************************************************/
    request: MDRequest;
    compiled: Prose;
    get proseCompiled(): import("./compiler/compile-state.ts").CompileState;
    /*********************************************************************
     * This is a pattern to help reduce flashes of content during
     * the intermediate states of the above request fetchers.
     * When a new request starts, we'll hold on the old value for as long as
     * we can, and only swap out the old data when the new data is done loading.
     *
     ********************************************************************/
    get prose(): import("@glint/template").ComponentLike<{}> | undefined;
    /**
     * Once this whole thing is "true", we can start
     * rendering without extra flashes.
     */
    get isReady(): boolean;
    get isPending(): boolean;
    get hasError(): boolean;
    get error(): string;
    get hasProse(): boolean;
    get path(): string | undefined;
    get page(): Page | undefined;
}
declare module '@ember/service' {
    interface Registry {
        'kolay/selected': Selected;
    }
}
export {};
