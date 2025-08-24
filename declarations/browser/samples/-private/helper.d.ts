import Helper from '@ember/component/helper';
import type { HelperLike } from '@glint/template';
/**
 * @param {number} first - the first argument
 * @param {number} second - the second argument
 * @return {number} the sum of the two values
 */
export declare function plainHelperA(first: number, second: number): number;
export declare const helperLikeB: HelperLike<{
    Args: {
        Named: {
            optional?: boolean;
        };
        Positional: [first: string, second?: string];
    };
    Return: string;
}>;
export declare const plainHelperC: (a: number, b: number, options?: {
    optional?: boolean;
    required: boolean;
}) => void;
export declare class classHelperD extends Helper<{
    Args: {
        Named: {
            optional?: boolean;
        };
        Positional: [first: string, second?: string];
    };
    Return: string;
}> {
}
export interface ESignature {
    Args: {
        Named: {
            optional?: boolean;
        };
        Positional: [first: string, second?: string];
    };
    Return: string;
}
export declare class classHelperE extends Helper<ESignature> {
}
//# sourceMappingURL=helper.d.ts.map