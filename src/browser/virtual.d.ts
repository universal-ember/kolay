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
 * Virtual Module responsible for building a "manifest"
 * for:
 * - where all the markdown files in your project
 * can be fetched at runtime
 * - the structure of all those files
 * - the nesting / grouping / library association of those files
 */
declare module 'kolay/manifest:virtual' {
  import type { Manifest } from '@universal-ember/kolay-ui/services/kolay/types';

  /**
   * Loads the list and tree data for the discovered pages from the markdownDocs plugin
   *
   */
  export const load: () => Promise<Manifest>;
}
