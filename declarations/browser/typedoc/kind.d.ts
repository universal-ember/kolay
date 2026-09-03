import type { TOC } from '@ember/component/template-only';
import type { SomeType } from 'typedoc';
/**
 * What a type *is*, when it is something invokable from a template.
 *
 * The types that say so -- `ComponentLike`, `HelperLike`, `TOC`,
 * `WithBoundArgs`, and friends -- are Glint plumbing that readers shouldn't
 * have to know. The kind is the part they actually need: whether the thing
 * they've been handed is a component, a modifier, a helper, or a function.
 */
export type Kind = 'component' | 'modifier' | 'helper' | 'function';
export declare function isKindWrapper(name: string | undefined): boolean;
export declare function kindOf(type: SomeType | undefined, depth?: number): Kind | undefined;
export declare const Kind: TOC<{
    Args: {
        kind: Kind;
    };
}>;
//# sourceMappingURL=kind.d.ts.map