import Component from '@glimmer/component';
import { Kind, type Kind as KindName } from '../kind';
import { type SingleSignature } from './component';
import type { ProjectReflection, ReferenceType, Reflection, SomeType } from 'typedoc';
/**
 * A type that can be invoked from a template -- a component, a modifier, or a
 * helper -- rendered as its signature, rather than as the type expression
 * that describes it.
 *
 * The type expressions are Glint plumbing: `ComponentLike<Signature>` says
 * "component", and `WithBoundArgs<typeof Foo, 'a' | 'b'>` says "what's left
 * of Foo once `a` and `b` have been passed" -- naming the args a consumer
 * *cannot* pass, the inverse of what a reader needs. Both render as the
 * signature that is actually being handed over.
 */
export declare function isWithBoundArgs(type: SomeType | undefined): type is ReferenceType;
export declare function isInvokable(type: SomeType | undefined): type is ReferenceType;
interface Invoked {
    /**
     * What it is, when we can tell. Also picks the shape it renders in.
     */
    kind: KindName | undefined;
    /**
     * The reference to render a name for -- absent for a wrapper, whose name
     * is plumbing that the kind label replaces.
     */
    named: ReferenceType | undefined;
    /**
     * The declaration the signature came from. Two types that resolve to the
     * same one are the same signature, which is how self-reference is spotted.
     */
    source: Reflection | undefined;
    variants: SingleSignature[];
}
export declare function invoked(info: ReferenceType, project: ProjectReflection): Invoked;
export declare class Invokable extends Component<{
    Args: {
        info: ReferenceType;
        project: ProjectReflection;
    };
}> {
    #private;
    /**
     * Marks where we are in the document, so that we can tell whether this same
     * signature is already being rendered further up. Components hand back
     * bound copies of themselves and of each other, and expanding those forever
     * would hang the page -- and repeat what the reader has already read.
     */
    anchor: Text;
    get named(): ReferenceType | undefined;
    get kind(): Kind | undefined;
    /**
     * Components render Element/Args/Blocks; the other two don't.
     */
    get shape(): Kind;
    get id(): import("typedoc", { with: { "resolution-mode": "import" } }).ReflectionId | undefined;
    /**
     * The same signature is already being rendered further up.
     */
    get isRecursive(): boolean;
    /**
     * One level of expansion answers "what am I being handed?". A second level
     * answers a question the reader didn't ask, and turns the page into a wall
     * -- what's yielded by what's yielded is a page of its own.
     */
    get variants(): SingleSignature[];
}
export {};
//# sourceMappingURL=invokable.d.ts.map