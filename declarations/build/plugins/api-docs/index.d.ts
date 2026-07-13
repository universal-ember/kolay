/**
 * Generates JSON from typedoc given a target path.
 *
 * May be used multiple times to generate multiple docs
 * for multiple libraries
 *
 * example:
 * ```js
 * import { typedoc, helpers } from 'kolay';
 *
 * typedoc.webpack({
 *   dest: '/api-docs/ember-primitives.json
 *   entryPoints: [
 *     helpers.pkgGlob(
 *       require.resolve('ember-primitives'),
 *        'declarations'
 *      )
 *   ]
 * })
 * ```
 *
 * @type {(options: import('./types.ts').APIDocsOptions) => import('unplugin').UnpluginOptions}
 */
export const apiDocs: (options: any) => import("unplugin").UnpluginOptions;
//# sourceMappingURL=index.d.ts.map