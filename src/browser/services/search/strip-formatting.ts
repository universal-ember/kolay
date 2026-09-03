/**
 * NOTE: this is bonkers, but *way* faster than parsing markdown and printing HTML
 *
 * The excerpt's own source, stripped of the syntax that would read as noise.
 *
 * An excerpt is two lines of prose, which is worth no more than a pass of
 * replacements: compiling each one as markdown cost a few milliseconds per
 * result, serialized, and rendered nothing a reader could tell apart.
 */
export function stripFormatting(
  text: string | null,
  range: { start: number; end: number }
): string {
  return (
    (text ?? '')
      .slice(range.start, range.end)
      .replaceAll(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '') // list markers
      .replaceAll(/^\s*>\s?/gm, '') // blockquote markers
      .replaceAll(/^\s*\[\^[^\]]+\]:\s*/gm, '') // the label a footnote is defined under
      .replaceAll(/\[\^[^\]]+\]/g, '') // and the references to it
      .replaceAll(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images: their text
      .replaceAll(/!?\[([^\]]*)\]\[[^\]]*\]/g, '$1') // and the same for reference links
      .replaceAll(/\s*\|\s*/g, ' ') // table cell walls
      .replaceAll(/:?-{3,}:?/g, ' ') // and the rule under its header row
      .replaceAll(/[`*_~]/g, '') // emphasis and code marks
      // Inline HTML, keeping the text it wrapped. Lowercase names only: every
      // HTML element has one, and a component written in prose does not, so
      // `<Search />` survives and `<kbd>` does not.
      .replaceAll(/<\/?[a-z][a-z0-9-]*(?:\s[^>]*?)?\/?>/g, '')
      .replaceAll(/\s+/g, ' ')
      .trim()
  );
}
