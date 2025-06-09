import type { ModifierLike } from '@glint/template';
export interface ModifierSignatureA {
    Element: HTMLDivElement;
    Args: {
        Positional: [x: number, y: number];
        Named: {
            invert?: boolean;
        };
    };
}
export declare const functionModifierA: import("ember-modifier").FunctionBasedModifier<{
    Element: HTMLDivElement;
    Args: {
        Named: {
            invert?: boolean;
        };
        Positional: [x: number, y: number];
    };
}>;
export declare const functionModifierB: import("ember-modifier").FunctionBasedModifier<{
    Args: {
        Positional: [x: number, y: number];
        Named: {
            invert?: boolean;
        };
    };
    Element: HTMLDivElement;
}>;
export declare const functionModifierC: ModifierLike<{
    Element: HTMLDivElement;
    Args: {
        Positional: [x: number, y: number];
        Named: {
            invert?: boolean;
        };
    };
}>;
//# sourceMappingURL=modifier.d.ts.map