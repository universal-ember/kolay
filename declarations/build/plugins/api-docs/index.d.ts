/**
 * Generates typedoc JSON for the given packages and provides
 * 'kolay/api-docs:virtual' for loading it. See the public `apiDocs()`
 * entry in ./combined.js:
 *
 * ```js
 * import { docs, apiDocs } from 'kolay/vite';
 *
 * apiDocs(['ember-primitives', './packages/my-library']);
 * ```
 *
 * @type {(state: { options: object, usages: object[], isPrimary: boolean }) => import('unplugin').UnpluginOptions}
 */
export const apiDocs: (state: {
    options: object;
    usages: object[];
    isPrimary: boolean;
}) => import("unplugin").UnpluginOptions;
//# sourceMappingURL=index.d.ts.map