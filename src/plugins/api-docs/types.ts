export interface APIDocsOptions {
  /**
   * List of packages to generate api docs for
   */
  packages: string[];

  /**
   * Destination folder to place the api docs json files in.
   * Defaults to "docs"
   */
  dest?: string | undefined;
}
