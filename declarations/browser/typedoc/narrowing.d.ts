import type { LiteralType, ReferenceType, SomeType } from 'typedoc';
interface HasType {
    type: string;
}
export declare function isReference(x?: HasType): x is ReferenceType;
export declare function isLiteral(x: SomeType | undefined): x is LiteralType;
export {};
//# sourceMappingURL=narrowing.d.ts.map