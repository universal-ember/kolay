/**
 * Internal module containing the means of fetching typedoc documents
 * at runtime / on-demand, via fetch.
 *
 * This structure is not meant to be used directly, but passed to the docs service.
 */
declare module 'kolay/api-docs:virtual' {
  /**
   * The list of packages passed to the apiDocs
   * plugin:
   *
   * apiDocs({ packages: ['kolay', 'ember-primitives', 'ember-resources'] }),
   *
   */
  export const packageNames: string[];

  /**
   * A record of functions where the key for each function
   * is the name of one the packages passed to the api docs plugin.
   *
   * apiDocs({ packages: ['kolay', 'ember-primitives', 'ember-resources'] }),
   *
   * For example:
   *
   *   loadApiDocs['kolay']()
   */
  export const loadApiDocs: Record<string, () => ReturnType<typeof fetch>>;
}

/**
 * The metamanifest: which docs groups exist, and how to load each group's
 * docs module. `setupKolay` loads them all in parallel behind the scenes
 * (via `loadCompiledDocs` from 'kolay').
 */
declare module 'kolay/compiled-docs:virtual' {
  import type { DocsGroupModule } from 'kolay';

  export const base: string;

  export const redirects: Array<{ from: string; to: string }>;

  export const groups: Array<{ name: string; load: () => Promise<DocsGroupModule> }>;
}
