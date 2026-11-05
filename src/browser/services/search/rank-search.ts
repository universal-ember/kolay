import { excerptRangeFromText } from './excerpt.ts';

import type { SearchEntry, SearchResult } from '../../../types.ts';

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
      // Readers search for what a page is called as often as for what it says,
      // and a page's title need not resemble its URL — a page at
      // `ember-resources.md` headed `# cell` is reachable by either word.
      const path = entry.appRelativePath.toLocaleLowerCase();
      const titleMatches = terms.filter((term) => title.includes(term)).length;
      const headingMatches = terms.filter((term) => headings.includes(term)).length;
      const pathMatches = terms.filter((term) => path.includes(term)).length;
      const bodyMatches = terms.filter((term) => text.includes(term)).length;
      const score = titleMatches * 100 + headingMatches * 25 + pathMatches * 10 + bodyMatches;
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
