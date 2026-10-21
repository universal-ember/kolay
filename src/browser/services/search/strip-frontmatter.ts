/**
 * A leading (closed) frontmatter block: `---`, lines, `---`. The build
 * strips frontmatter from the text it inlines; this covers the text the
 * runtime loads itself — a plain `.md`'s raw source, from its bundled
 * loader or a fetch of the deployed file.
 */
const FRONTMATTER_BLOCK = /^\uFEFF?---\r?\n([\s\S]*?\r?\n)?---(\r?\n|$)/;

export function stripFrontmatter(text: string): string {
  return text.replace(FRONTMATTER_BLOCK, '');
}
