import type { Manifest, NavNode, Page, PageTree } from '../types.ts';
import type { ComponentLike } from '@glint/template';

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

/**
 * What each `virtual:kolay/docs/<groupName>` module provides.
 */
export interface DocsGroupModule {
  name: string;
  /**
   * The group's own manifest: its pages flat, and the root of its page
   * tree — a `PageTree` named after the group, whose `pages` are the
   * folders and pages one level in.
   */
  manifest: { name: string; list: Page[]; tree: PageTree };
  /**
   * The source's meta: repository URL, repo-relative docs path, and
   * anything from the source root's `meta.jsonc`.
   */
  meta: DocsSourceMeta;
  /**
   * Similar to import.meta.glob — the group's page loaders, keyed by URL.
   */
  pages: Record<string, () => Promise<{ default: string | ComponentLike }>>;
  /**
   * Registers the docs routes for this group, scoped to it —
   * `addRoutes(this)` inside any route brings this group's docs into it.
   */
  addRoutes: (context: unknown) => void;
}

/**
 * What 'kolay/compiled-docs:virtual' provides: the metamanifest — which
 * groups exist, and how to load each group's docs module.
 */
export interface MetaManifest {
  base: string;
  /**
   * Path redirects from the project's kolay config file — `[]` when
   * there is no config file (or it has no `redirects`).
   */
  redirects: Array<{ from: string; to: string }>;
  groups: Array<{ name: string; load: () => Promise<DocsGroupModule> }>;
  /**
   * The navigation the groups' `docs()` usages describe: a node per
   * top-level group, with the groups it collects (`collection: [...]`)
   * beneath it. The nav-layer grouping lives here, at the metamanifest
   * level, rather than inside each group's own module.
   */
  nav: NavNode[];
}

/**
 * Loads every group's docs module — in parallel, for site speed — and
 * assembles the combined manifest + page-loader map the docs service
 * consumes. `setupKolay` does this behind the scenes.
 */
export async function loadCompiledDocs(meta: MetaManifest): Promise<{
  manifest: Manifest;
  pages: DocsGroupModule['pages'];
}> {
  const modules = await Promise.all(meta.groups.map((group) => group.load()));

  return {
    manifest: {
      base: meta.base,
      redirects: meta.redirects,
      groups: modules.map((mod) => mod.manifest),
      // the navigation is metamanifest data — it spans the groups, rather
      // than belonging to any one of them
      nav: meta.nav,
    },
    pages: Object.assign({}, ...modules.map((mod) => mod.pages)) as DocsGroupModule['pages'],
  };
}
