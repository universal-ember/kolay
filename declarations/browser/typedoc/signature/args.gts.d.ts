import type { TOC } from '@ember/component/template-only';
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
export declare function getArgs(info: any): any;
