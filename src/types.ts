import type Owner from '@ember/owner';

export interface Secret {
  owners: Set<Owner>;
}

export type LoadManifest = () => Promise<Manifest>;
export type LoadTypedoc = Record<string, () => ReturnType<typeof fetch>>;

/**
 * A docs source's meta, from `virtual:kolay/docs/<groupName>`:
 * derived from the repository root's package.json, mixed with the
 * content of a `meta.jsonc` at the root of the source (user keys win).
 */
export interface DocsSourceMeta {
  /**
   * The repository URL (GitHub, etc), from the root package.json's
   * `repository` field.
   */
  url?: string;
  /**
   * The repo-relative path to this source's docs.
   */
  docsPath?: string;
  [key: string]: unknown;
}

export interface Manifest {
  /**
   * The rootURL / base URL this manifest was generated with.
   * Item `path`s are prefixed with it; `appRelativePath`s are not.
   */
  base: string;
  /**
   * Path redirects from the project's kolay config file
   * (`kolay.config.js` and friends, discovered via lilconfig at build
   * time). Applied by `handlePotentialIndexVisit` when a visited URL
   * matches. `[]` when there is no config file / no entries.
   */
  redirects: {
    from: string;
    to: string;
  }[];
  groups: {
    name: string;
    list: Page[];
    tree: PageTree;
    /**
     * The group's source meta: repository URL, repo-relative docs path,
     * and anything from the source root's `meta.jsonc`.
     */
    meta: DocsSourceMeta;
  }[];
}

export interface SearchEntry {
  path: string;
  appRelativePath: string;
  groupName: string;
  title: string;
  headings: string[];
  /**
   * The page's markdown, when the build could inline it. Pages it couldn't
   * are loaded on demand — from `appRelativePath`, since where a page can be
   * read from is only known once the app is running under its rootURL.
   */
  text: string;
}

export interface SearchResult extends SearchEntry {
  score: number;
  match: string;
  excerptRange: { start: number; end: number };
}

export interface PageTree {
  /**
   * The folder's own directory segment, e.g. 'sub-folder'.
   */
  path: string;
  /**
   * URL-space location of the folder as if the app were deployed at '/',
   * e.g. '/Documentation/sub-folder'.
   */
  appRelativePath: string;
  name: string;
  first?: string;
  pages: (PageTree | Page)[];
  groupName?: never;
}

export interface Page {
  /**
   * The page's URL, prefixed with the app's rootURL (the manifest's `base`),
   * e.g. '/my-github-project/Documentation/sub-folder/x.md'.
   * This is the space hrefs (and the compiled-docs module map) operate in.
   */
  path: string;
  /**
   * The page's URL as if the app were deployed at '/',
   * e.g. '/Documentation/sub-folder/x.md'.
   * This is the space `router.currentURL` and `transitionTo` operate in.
   */
  appRelativePath: string;
  name: string;
  /**
   * The cleaned name of the folder the page is in, e.g. 'sub folder'.
   * Empty for a page at the root of its source — there is no folder to
   * name it after.
   */
  groupName: string;
  cleanedName: string;
  /**
   * The link text to display for this page in navigation, when the
   * derived `name` isn't right — set via a json file next to the page:
   * `{ "title": "selected(...)" }`
   */
  title?: string;
  /**
   * Present on nav-only link entries (a json file with an `href` and no
   * markdown file of its own): the authored link target, as if the app
   * were deployed at '/' — e.g. a page in another group.
   * `path` / `appRelativePath` are derived from it.
   */
  href?: string;
  /**
   * Page metadata: the page's YAML frontmatter, deeply merged with the
   * `meta` key of its sibling json config (frontmatter wins)
   * A custom `populateManifestEntry` may be defined to modify this behavior
   */
  meta?: Record<string, unknown>;
}

export type Node = Page | PageTree;

/**
 * @internal
 */
export type GatheredDocs = Array<{
  mdPath: string;
  config?: object;
  frontmatter?: Record<string, unknown>;
}>;
