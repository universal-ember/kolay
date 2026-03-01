import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection, Reflection, SignatureReflection } from 'typedoc';
/**
 * Only components' args are prefixed with a `@`,
 * because only components have template-content.
 */
export declare const Args: TOC<{
    Args: {
        kind: 'component' | 'modifier' | 'helper';
        info: any;
    };
}>;
/**
 * Returns args for either a function or signature
 */
export declare function getArgs(info?: Reflection | SignatureReflection | DeclarationReflection | DeclarationReflection[]): DeclarationReflection | import("typedoc", { with: { "resolution-mode": "import" } }).ParameterReflection[] | undefined;
//# sourceMappingURL=args.d.ts.map