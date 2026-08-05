import type Owner from '@ember/owner';

export interface Secret {
  owners: Set<Owner>;
}

export type LoadManifest = () => Promise<Manifest>;
export type LoadTypedoc = Record<string, () => ReturnType<typeof fetch>>;

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
    tree: Collection;
  }[];
}

export interface Collection {
  /**
   * The collection's own directory segment, e.g. 'sub-folder'.
   */
  path: string;
  /**
   * URL-space location of the collection as if the app were deployed at '/',
   * e.g. '/Documentation/sub-folder'.
   */
  appRelativePath: string;
  name: string;
  first?: string;
  pages: (Collection | Page)[];
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
}

export type Node = Page | Collection;

/**
 * @internal
 */
export type GatheredDocs = Array<{ mdPath: string; config?: object }>;
