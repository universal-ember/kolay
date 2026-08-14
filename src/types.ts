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
  groups: Group[];
  /**
   * The navigation, as the groups' `docs()` usages describe it: a node per
   * top-level group, where a group that collects others (`collection: [...]`)
   * stands in for the whole tree beneath it. Routing is unaffected — every
   * group in it keeps its own pages, URLs, and (when it has one) scoped
   * mount.
   */
  nav: NavNode[];
}

export interface Group {
  name: string;
  list: Page[];
  tree: PageTree;
}

/**
 * One group in the navigation, with the groups it collects beneath it —
 * either a group with pages of its own, or one with none, which exists to
 * present the groups it collects and so must collect at least one.
 */
export type NavNode = NavGroup | NavCollection;

/**
 * A group with pages of its own, and any groups it collects.
 */
export interface NavGroup {
  /**
   * The group's name, which is what the navigation shows.
   */
  name: string;
  /**
   * The group whose pages this node contributes — the same as `name`.
   */
  group: string;
  /**
   * The groups this one collects, in the order they were declared.
   */
  children: NavNode[];
}

/**
 * A group with no `src` of its own: it contributes no pages, and exists to
 * present the groups it collects — so it collects at least one, which is
 * what makes it possible to say where its nav entry lands.
 */
export interface NavCollection {
  name: string;
  group: null;
  children: [NavNode, ...NavNode[]];
}

/**
 * One top-level navigation entry: a group, together with any groups it
 * collects. `navEntries` on the docs service computes these.
 */
export interface NavEntry {
  /**
   * Formatting this for display is the app's job, as it already is for
   * group names.
   */
  name: string;
  /**
   * Whether this group collects others. Not derivable from `groups`: a
   * group with no pages of its own that collects one other group presents
   * exactly one group, the same as a group that collects nothing does.
   */
  isCollection: boolean;
  /**
   * The groups whose pages this entry presents: its own first when it has
   * any, then the ones it collects, in declaration order, depth first. The
   * first is where the entry lands, which is what `href` points at.
   */
  groups: Group[];
  /**
   * Where the entry's nav link points: its group's own URL, or — for a
   * group with no pages of its own — the first collected group's, since
   * there is nothing else to land on. Includes the rootURL, like
   * `groupHrefFor`.
   */
  href: string;
  /**
   * The page tree to render for the entry: the group's own tree, or — when
   * it collects others — its own pages followed by a labeled section per
   * collected group.
   */
  tree: PageTree;
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

export type Node = Page | PageTree;

/**
 * @internal
 */
export type GatheredDocs = Array<{ mdPath: string; config?: object }>;
