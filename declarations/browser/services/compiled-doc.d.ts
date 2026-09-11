import type { ComponentLike } from '@glint/template';
import type { State } from 'reactiveweb/get-promise-state';
/**
 * A module containing a document, e.g. the result of `import('/some-doc.md?raw')`
 * or of a compiled `.gjs.md` module.
 */
export type DocModule = {
    default: string | ComponentLike;
};
/**
 * What a document may be loaded as:
 * - a string of markdown (compiled in the browser)
 * - an already-compiled component (e.g.: the module of a build-time-compiled `.gjs.md` file)
 * - a module whose default export is either of the above
 */
export type DocSource = string | ComponentLike | DocModule;
/**
 * Reactive state for rendering a single document that you load yourself.
 *
 * This is the same machinery that the `<Page />` component (via `selected`)
 * uses for rendering the current page — extracted so that documents fetched
 * any other way (`fetch`, `import()`, inline strings, etc.) get the same
 * loading / error / anti-flicker behavior.
 *
 * The compiler is configured via `setupKolay` (or `setupCompiler` in
 * tests), so one of those must have run before a document loads.
 *
 * The `load` function is reactive: any tracked data read synchronously
 * (before the first `await`) will cause the document to be re-loaded when
 * that data changes. While re-loading, the previously rendered document is
 * kept, avoiding a flash of emptiness.
 *
 * ```gjs
 * import Component from '@glimmer/component';
 * import { compiledDoc } from 'kolay';
 *
 * export default class MyPage extends Component {
 *   doc = compiledDoc(() =>
 *     fetch(`/my-docs/${this.args.name}.md`).then((response) => response.text())
 *   );
 *
 *   <template>
 *     {{#if this.doc.isPending}}
 *       loading…
 *     {{else if this.doc.hasError}}
 *       {{this.doc.error}}
 *     {{else if this.doc.prose}}
 *       <this.doc.prose />
 *     {{/if}}
 *   </template>
 * }
 * ```
 */
export declare function compiledDoc(load: () => DocSource | Promise<DocSource> | undefined): CompiledDoc;
export declare class CompiledDoc {
    #private;
    constructor(load: () => DocSource | Promise<DocSource> | undefined);
    /*********************************************************************
     * This is a pattern to help reduce flashes of content during
     * the intermediate states of the above request fetchers.
     * When a new request starts, we'll hold on the old value for as long as
     * we can, and only swap out the old data when the new data is done loading.
     *
     * (reading `isLoading` entangles this getter with the request's
     *  progress, so consumers re-render when loading finishes)
     ********************************************************************/
    get latest(): State<ComponentLike | undefined> | undefined;
    /**
     * The rendered document, ready for invoking.
     * While a new document is loading, this remains the previous document.
     */
    get prose(): ComponentLike | undefined;
    get isReady(): boolean;
    get isPending(): boolean;
    /**
     * The raw error from loading or compiling, if there was one.
     * See `error` for a human-readable message.
     */
    get rawError(): unknown;
    /**
     * A human-readable message extracted from `rawError`
     * (may be `''` when the raw error has no extractable message).
     */
    get error(): string;
    get hasError(): boolean;
}
//# sourceMappingURL=compiled-doc.d.ts.map