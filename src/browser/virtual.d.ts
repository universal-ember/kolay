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
 * Virtual Module responsible for providing
 * pre-compiled markdown documents compiled to components for faster loading and rendering
 */
declare module 'kolay/compiled-docs:virtual' {
  import type { ComponentLike } from '@glint/template';
  import type { Manifest } from '#types';

  /**
   * The Manifest is / knows:
   * - where all the markdown files in your project
   * can be fetched at runtime
   * - the structure of all those files
   * - the nesting / grouping / library association of those files
   */
  export const manifest: Manifest;

  /**
   * Similar to import.meta.glob
   */
  export const pages: Record<string, () => Promise<{ default: ComponentLike }>>;
}
