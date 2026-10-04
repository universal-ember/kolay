/**
 * NOTE: this is bonkers, but *way* faster than parsing markdown and printing HTML
 *
 * The excerpt's own source, stripped of the syntax that would read as noise.
 *
 * An excerpt is two lines of prose, which is worth no more than a pass of
 * replacements: compiling each one as markdown cost a few milliseconds per
 * result, serialized, and rendered nothing a reader could tell apart.
 */
export declare function stripFormatting(text: string | null, range: {
    start: number;
    end: number;
}): string;
//# sourceMappingURL=strip-formatting.d.ts.map