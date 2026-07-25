import type { Collection, Manifest, Page } from '../types.ts';
import type { ComponentLike } from '@glint/template';

/**
 * What each `virtual:kolay/docs/<groupName>` module provides.
 */
export interface DocsGroupModule {
  name: string;
  /**
   * The group's own manifest.
   */
  manifest: { name: string; list: Page[]; tree: Collection };
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
  groups: Array<{ name: string; load: () => Promise<DocsGroupModule> }>;
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
      groups: modules.map((mod) => mod.manifest),
    },
    pages: Object.assign({}, ...modules.map((mod) => mod.pages)) as DocsGroupModule['pages'],
  };
}
