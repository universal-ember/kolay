import type DocsService from './docs.ts';
export declare const OUTPUT_PREFIX = "/docs/";
export declare const OUTPUT_PREFIX_REGEX: RegExp;
/**
 * With how data is derived here, the `fetch` request does not execute
 * if we know ahead of time that the fetch would fail.
 * e.g.: when the URL is not declared in the manifest.
 *
 * The `fetch` only occurs when `last` is accessd.
 * and `last` is not accessed if `doesPageExist` is ever false.
 */
export declare class MDRequest {
    #private;
    private urlFn;
    constructor(urlFn: () => string);
    docs: DocsService;
    /**
     * TODO: use a private property when we move to spec-decorators
     */
    last: import("reactiveweb/remote-data").State<string>;
    lastSuccessful: string | null;
    get hasError(): boolean;
    /**
     * TODO: use a private property when we move to spec-decorators
     */
    private get _doesPageExist();
}
//# sourceMappingURL=request.d.ts.map