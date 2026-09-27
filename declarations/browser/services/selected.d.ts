import type { CompiledDoc } from './compiled-doc.ts';
import type { ComponentLike } from '@glint/template';
export declare function selected(context: unknown): Selected;
type File = {
    default: string | ComponentLike;
};
type Loader = () => Promise<File>;
/**
 * The store `selected(context)` returns.
 */
declare class Selected {
    #private;
    private router;
    /**
     * The page-module map — path to document loader.
     * `setupKolay` fills this in; reading it directly is rarely needed.
     */
    compiledDocs: Record<string, Loader>;
    /**
     * The load / compile / error state for the current page's document.
     */
    doc: CompiledDoc;
    /**
     * The rendered document (a component), if ready.
     *
     * While a new page loads (or after it errored), this keeps the
     * previously rendered page, so navigation doesn't flash an empty screen.
     */
    get prose(): ComponentLike | undefined;
    /**
     * Has the current page finished loading and compiling?
     */
    get isReady(): boolean;
    /**
     * Is the current page still loading / compiling?
     */
    get isPending(): boolean;
    /**
     * Did resolving the page, loading, or compiling fail?
     */
    get hasError(): boolean;
    /**
     * A human-readable error message; `''` when there is none.
     */
    get error(): string;
    /**
     * `Boolean(this.prose)`
     */
    get hasProse(): boolean;
}
export type { Selected };
//# sourceMappingURL=selected.d.ts.map