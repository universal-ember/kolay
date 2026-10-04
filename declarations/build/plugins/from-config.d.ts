/**
 * The plugins a kolay config describes: one `docs()` per `docs` entry,
 * one `demos()` / `importEntrypoints()` per entry of theirs, and one
 * `apiDocs()` for the `apiDocs` list. A key that is not specified
 * generates nothing.
 *
 * `markdownOptions` is shared by every docs entry; an entry's own
 * options win.
 *
 * @param {KolayConfig} config
 * @param {string} configDir
 */
export function pluginsFromConfig(config: KolayConfig, configDir: string): any[];
/**
 * The all-in-one plugin: discovers the project's kolay config file and
 * generates the `docs()`, `apiDocs()`, `demos()`, and
 * `importEntrypoints()` plugins it describes.
 *
 * ```js
 * // vite.config.js
 * import { kolay } from 'kolay/vite';
 *
 * export default defineConfig({
 *   plugins: [ember(), kolay()],
 * });
 * ```
 *
 * The individual plugins remain available and compose with this one —
 * their usages and the generated ones discover each other the same way
 * multiple direct usages do.
 */
export function kolay(): Promise<any[]>;
export type KolayConfig = import("./kolay-config.js").KolayConfig;
//# sourceMappingURL=from-config.d.ts.map