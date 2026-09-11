/**
 * The excerpt is a couple of lines of prose, so the range has to be no
 * bigger than the thought that matched: a five-item list whose match is in
 * the last item would excerpt to the first item and highlight nothing.
 * Prose only — a fenced sample of the very syntax being documented, or the
 * markup of a hand-written HTML block, reads as noise next to the sentence
 * that explains it. Both run until they are closed, so both are tracked
 * across lines rather than recognized one line at a time.
 */
export declare function excerptRangeFromText(text: string, term: string | undefined): {
    start: number;
    end: number;
};
//# sourceMappingURL=excerpt.d.ts.map