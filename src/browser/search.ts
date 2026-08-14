import type { SearchEntry, SearchResult } from '../types.ts';

export function rankSearch(entries: SearchEntry[], query: string): SearchResult[] {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);

  if (terms.length === 0) return [];

  return entries
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase();
      const headings = [...entry.headings, ...headingsFromText(entry.text)]
        .join(' ')
        .toLocaleLowerCase();
      const text = entry.text.toLocaleLowerCase();
      const titleMatches = terms.filter((term) => title.includes(term)).length;
      const headingMatches = terms.filter((term) => headings.includes(term)).length;
      const bodyMatches = terms.filter((term) => text.includes(term)).length;
      const score = titleMatches * 100 + headingMatches * 25 + bodyMatches;
      const match = entry.title || entry.headings[0] || entry.groupName;
      const firstTerm = terms.find((term) => text.includes(term));
      const excerptRange = excerptRangeFromText(entry.text, firstTerm);

      return { ...entry, score, match, excerptRange };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

function headingsFromText(text: string): string[] {
  return [...text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].flatMap(([, heading]) =>
    heading ? [stripInlineSyntax(heading)] : []
  );
}

/**
 * A heading is shown as-is, so the source's inline syntax has no business
 * being in it — the marks CommonMark uses for emphasis and code, and the
 * `[^label]` a footnote reference leaves behind.
 */
function stripInlineSyntax(value: string): string {
  return value
    .replaceAll(/\[\^[^\]]+\]/g, '')
    .replaceAll(/[`*_]/g, '')
    .trim();
}

/**
 * Where a list item or a footnote definition starts: each is its own
 * excerpt-sized thought, even though a whole list is one block.
 */
const ITEM_START = /^\s*(?:[-*+]\s|\d+[.)]\s|\[\^[^\]]+\]:)/;

const FENCE = /^\s*(?:```|~~~)/;
const HEADING = /^\s*#{1,6}\s/;
const HTML_START = /^\s*</;

/**
 * The excerpt is a couple of lines of prose, so the range has to be no
 * bigger than the thought that matched: a five-item list whose match is in
 * the last item would excerpt to the first item and highlight nothing.
 * Prose only — a fenced sample of the very syntax being documented, or the
 * markup of a hand-written HTML block, reads as noise next to the sentence
 * that explains it. Both run until they are closed, so both are tracked
 * across lines rather than recognized one line at a time.
 */
function excerptRangeFromText(text: string, term: string | undefined) {
  const ranges: { start: number; end: number; value: string }[] = [];
  let offset = 0;
  let fenced = false;
  let html = false;
  let current: { start: number; end: number; value: string } | undefined;

  for (const line of text.split('\n')) {
    const start = offset;

    offset += line.length + 1;

    if (FENCE.test(line)) {
      fenced = !fenced;
      current = undefined;
      continue;
    }

    // a blank line is what closes an HTML block, per CommonMark
    if (!line.trim()) {
      html = false;
      current = undefined;
      continue;
    }

    if (!fenced && HTML_START.test(line)) {
      html = true;
      current = undefined;
      continue;
    }

    if (fenced || html || HEADING.test(line)) {
      current = undefined;
      continue;
    }

    // a line that opens an item breaks off a new range; anything else is a
    // continuation of the lines above it
    if (current && !ITEM_START.test(line)) {
      current.end = start + line.length;
      current.value += `\n${line.toLocaleLowerCase()}`;
      continue;
    }

    current = { start, end: start + line.length, value: line.toLocaleLowerCase() };
    ranges.push(current);
  }

  const selected = ranges.find((range) => term && range.value.includes(term)) ?? ranges[0];

  return selected ? { start: selected.start, end: selected.end } : { start: 0, end: 0 };
}
