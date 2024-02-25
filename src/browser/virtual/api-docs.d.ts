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
