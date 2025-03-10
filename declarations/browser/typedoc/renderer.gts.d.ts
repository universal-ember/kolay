import type { TOC } from '@ember/component/template-only';
import type { DeclarationReference, NamedTupleMember, SomeType } from 'typedoc';
/**
 * Assumptions:
 * - we are documenting public API
 *   - component properties and methods are not public API
 *     - including the constructor, inherited methods, etc
 *   - only the signature describes what the public API is.
 */
export declare const APIDocs: TOC<{
    Args: {
        /**
         * Which module to import the type from
         */
        module: string;
        /**
         * The name of the export to render the type / JSDoc of
         */
        name: string;
        /**
         * The name of the package to lookup the module and export name.
         */
        package: string;
    };
}>;
/**
 * Used for referencing the comment on a const or class.
 *
 * For example:
 * ```
 * /*
 *  * Comment block here is what is targeted
 *  *\/
 * export const CommentQuery ...
 * ```
 *
 * Usage:
 * ```hbs
 * <CommentQuery @name="CommentQuery" ... />
 * ```
 */
export declare const CommentQuery: TOC<{
    Args: {
        /**
         * Which module to import the type from
         */
        module: string;
        /**
         * The name of the export to render the type / JSDoc of
         */
        name: string;
        /**
         * The name of the package to lookup the module and export name.
         */
        package: string;
    };
}>;
export declare function isGlimmerComponent(info: DeclarationReference): boolean;
export declare const Comment: TOC<{
    Args: {
        info: {
            comment?: {
                summary?: {
                    text: string;
                }[];
            };
        };
    };
}>;
export declare const isIntrinsic: (x: {
    type: string;
}) => boolean;
export declare const isNamedTuple: (x: SomeType | undefined) => x is NamedTupleMember;
export declare const NamedTuple: TOC<{
    Args: {
        info: NamedTupleMember;
    };
}>;
export declare const Type: TOC<{
    Args: {
        info: SomeType;
    };
}>;
